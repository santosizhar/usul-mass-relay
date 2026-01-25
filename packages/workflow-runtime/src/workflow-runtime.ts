import crypto from "crypto";
import fs from "fs";
import path from "path";

import {
  RunRecord,
  WorkflowRunRecord,
  WorkflowRunStatus,
  WorkflowStepRecord,
  WorkflowStepStatus
} from "../../run-model/src/run";
import { AuditLogEntry, HitlRequest } from "../../hitl-audit/src/hitl";
import { getRunDir, upsertRun } from "../../run-persistence/src/run-store";

export type WorkflowFailureMode = "halt" | "continue" | "queue-exception";
export type HitlRequestType = "approval" | "exception";

export interface WorkflowStepDefinition {
  step_id: string;
  name: string;
  action: string;
  retry?: {
    max_attempts: number;
    delay_ms?: number;
  };
  on_failure?: WorkflowFailureMode;
  hitl?: {
    type: HitlRequestType;
    summary: string;
    context_refs?: string[];
  };
}

export interface WorkflowDefinition {
  workflow_id: string;
  name: string;
  description?: string;
  version?: string;
  steps: WorkflowStepDefinition[];
}

export interface WorkflowStepOutcome {
  status: "success" | "failure";
  outputs?: string[];
  error?: string;
}

export type WorkflowStepHandler<Context> = (
  step: WorkflowStepDefinition,
  context: Context,
  attempt: number
) => Promise<WorkflowStepOutcome>;

export interface HitlQueue {
  approvals: HitlRequest[];
  exceptions: HitlRequest[];
  enqueueApproval: (request: HitlRequest) => void;
  enqueueException: (request: HitlRequest) => void;
}

export interface HitlOptions {
  queue: HitlQueue;
  requester: string;
  playbook_id: string;
}

export interface WorkflowRuntimeOptions {
  baseDir?: string;
  hitl?: HitlOptions;
}

export interface WorkflowRuntimeResult {
  run: RunRecord;
  workflow: WorkflowRunRecord;
  status: WorkflowRunStatus;
}

export const createInMemoryHitlQueue = (): HitlQueue => {
  const approvals: HitlRequest[] = [];
  const exceptions: HitlRequest[] = [];

  return {
    approvals,
    exceptions,
    enqueueApproval: (request) => approvals.push(request),
    enqueueException: (request) => exceptions.push(request)
  };
};

const createWorkflowRun = (definition: WorkflowDefinition, startedAt: string): WorkflowRunRecord => {
  return {
    workflow_id: definition.workflow_id,
    status: "pending",
    started_at: startedAt,
    steps: definition.steps.map((step) => ({
      step_id: step.step_id,
      status: "pending",
      attempts: 0
    }))
  };
};

const getStepRecord = (workflow: WorkflowRunRecord, stepId: string): WorkflowStepRecord => {
  const record = workflow.steps.find((step) => step.step_id === stepId);

  if (!record) {
    throw new Error(`Missing workflow step record for ${stepId}`);
  }

  return record;
};

const sleep = (durationMs: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
};

const recordHitlRequest = (
  request: HitlRequest,
  action: string,
  options: WorkflowRuntimeOptions
): { request: HitlRequest; audit: AuditLogEntry } => {
  const audit: AuditLogEntry = {
    audit_id: crypto.randomUUID(),
    run_id: request.run_id,
    timestamp: new Date().toISOString(),
    actor: request.requester,
    action,
    target: request.step_id,
    status: "success",
    metadata: {
      request_id: request.request_id,
      summary: request.summary
    }
  };

  if (options.baseDir) {
    const runDir = getRunDir(request.run_id, options.baseDir);
    const requestPath = path.join(runDir, "hitl", "requests", `${request.request_id}.json`);
    const auditPath = path.join(runDir, "hitl", "audit", `${audit.audit_id}.json`);

    fs.mkdirSync(path.dirname(requestPath), { recursive: true });
    fs.mkdirSync(path.dirname(auditPath), { recursive: true });
    fs.writeFileSync(requestPath, `${JSON.stringify(request, null, 2)}\n`, "utf8");
    fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  }

  return { request, audit };
};

const queueHitlRequest = (
  step: WorkflowStepDefinition,
  run: RunRecord,
  options: WorkflowRuntimeOptions
): HitlRequest => {
  if (!options.hitl) {
    throw new Error(`HITL requested for step ${step.step_id} but no queue configured.`);
  }

  const request: HitlRequest = {
    request_id: crypto.randomUUID(),
    run_id: run.run_id,
    playbook_id: options.hitl.playbook_id,
    step_id: step.step_id,
    requested_at: new Date().toISOString(),
    requester: options.hitl.requester,
    status: "pending",
    summary: step.hitl?.summary ?? `HITL required for ${step.name}`,
    context_refs: step.hitl?.context_refs ?? []
  };

  const action =
    step.hitl?.type === "exception" ? "hitl-exception-queued" : "hitl-approval-requested";
  const { request: recorded } = recordHitlRequest(request, action, options);

  if (step.hitl?.type === "exception") {
    options.hitl.queue.enqueueException(recorded);
  } else {
    options.hitl.queue.enqueueApproval(recorded);
  }

  return recorded;
};

const updateWorkflowStatus = (run: RunRecord, status: WorkflowRunStatus): void => {
  if (!run.workflow) {
    throw new Error("Run record is missing workflow state.");
  }

  run.workflow.status = status;

  if (status === "success" || status === "failure" || status === "partial") {
    run.workflow.completed_at = new Date().toISOString();
  }

  if (status === "success") {
    run.status = "success";
  } else if (status === "failure") {
    run.status = "failure";
  } else {
    run.status = "partial";
  }
};

export const executeWorkflow = async <Context>(
  definition: WorkflowDefinition,
  context: Context,
  handlers: Record<string, WorkflowStepHandler<Context>>,
  run: RunRecord,
  options: WorkflowRuntimeOptions = {}
): Promise<WorkflowRuntimeResult> => {
  const now = new Date().toISOString();

  if (!run.workflow || run.workflow.workflow_id !== definition.workflow_id) {
    run.workflow = createWorkflowRun(definition, now);
  }

  run.workflow.status = "running";
  upsertRun(run, { baseDir: options.baseDir });

  let sawFailure = false;

  for (const step of definition.steps) {
    const stepRecord = getStepRecord(run.workflow, step.step_id);

    if (stepRecord.status === "waiting_hitl") {
      updateWorkflowStatus(run, "waiting_hitl");
      upsertRun(run, { baseDir: options.baseDir });
      return { run, workflow: run.workflow, status: run.workflow.status };
    }

    if (stepRecord.status === "success" || stepRecord.status === "failure" || stepRecord.status === "skipped") {
      continue;
    }

    if (step.hitl?.type === "approval") {
      const request = queueHitlRequest(step, run, options);
      stepRecord.status = "waiting_hitl";
      stepRecord.hitl_request_id = request.request_id;
      updateWorkflowStatus(run, "waiting_hitl");
      upsertRun(run, { baseDir: options.baseDir });
      return { run, workflow: run.workflow, status: run.workflow.status };
    }

    const handler = handlers[step.action];
    if (!handler) {
      stepRecord.status = "failure";
      stepRecord.last_error = `No handler registered for ${step.action}`;
      sawFailure = true;
      if (step.on_failure === "continue") {
        continue;
      }
      updateWorkflowStatus(run, "failure");
      upsertRun(run, { baseDir: options.baseDir });
      return { run, workflow: run.workflow, status: run.workflow.status };
    }

    stepRecord.status = "running";
    stepRecord.started_at = stepRecord.started_at ?? new Date().toISOString();

    const maxAttempts = Math.max(step.retry?.max_attempts ?? 1, 1);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      stepRecord.attempts = attempt;
      upsertRun(run, { baseDir: options.baseDir });

      const outcome = await handler(step, context, attempt);

      if (outcome.status === "success") {
        stepRecord.status = "success";
        stepRecord.outputs = outcome.outputs ?? [];
        stepRecord.completed_at = new Date().toISOString();
        stepRecord.last_error = undefined;
        break;
      }

      stepRecord.last_error = outcome.error ?? "Workflow step failed.";

      if (attempt < maxAttempts && step.retry?.delay_ms) {
        await sleep(step.retry.delay_ms);
      }
    }

    if (stepRecord.status !== "success") {
      stepRecord.status = "failure";
      sawFailure = true;

      if (step.on_failure === "queue-exception") {
        const request = queueHitlRequest({ ...step, hitl: { ...(step.hitl ?? {}), type: "exception" } }, run, options);
        stepRecord.status = "waiting_hitl";
        stepRecord.hitl_request_id = request.request_id;
        updateWorkflowStatus(run, "waiting_hitl");
        upsertRun(run, { baseDir: options.baseDir });
        return { run, workflow: run.workflow, status: run.workflow.status };
      }

      if (step.on_failure === "continue") {
        continue;
      }

      updateWorkflowStatus(run, "failure");
      upsertRun(run, { baseDir: options.baseDir });
      return { run, workflow: run.workflow, status: run.workflow.status };
    }
  }

  if (sawFailure) {
    updateWorkflowStatus(run, "partial");
  } else {
    updateWorkflowStatus(run, "success");
  }

  upsertRun(run, { baseDir: options.baseDir });

  return { run, workflow: run.workflow, status: run.workflow.status };
};

export const updateStepStatus = (
  run: RunRecord,
  stepId: string,
  status: WorkflowStepStatus,
  options: WorkflowRuntimeOptions = {}
): WorkflowStepRecord => {
  if (!run.workflow) {
    throw new Error("Run record is missing workflow state.");
  }

  const stepRecord = getStepRecord(run.workflow, stepId);
  stepRecord.status = status;
  if (status === "success" || status === "failure" || status === "skipped") {
    stepRecord.completed_at = new Date().toISOString();
  }

  upsertRun(run, { baseDir: options.baseDir });
  return stepRecord;
};
