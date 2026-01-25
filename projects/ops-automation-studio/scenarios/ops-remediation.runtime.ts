import fs from "fs";
import path from "path";

import { executeWorkflow, createInMemoryHitlQueue } from "../../../packages/workflow-runtime/src/workflow-runtime";
import { RunRecord } from "../../../packages/run/src/run";
import { upsertRun } from "../../../packages/run/src/run-store";
import { ToolRuntimeExecutor } from "../../../packages/tool-runtime/src/tool-runtime";
import { ToolManifest } from "../../../packages/execution-contracts/src/tool-manifest";
import { ExecutionSandbox } from "../../../packages/execution-contracts/src/execution-sandbox";

type OpsWorkflowDefinition = {
  workflow_id: string;
  name: string;
  description?: string;
  version?: string;
  steps: Array<{
    step_id: string;
    name: string;
    action: string;
    retry?: {
      max_attempts: number;
      delay_ms?: number;
    };
    on_failure?: "halt" | "continue" | "queue-exception";
    hitl?: {
      type: "approval" | "exception";
      summary: string;
      context_refs?: string[];
    };
  }>;
};

const resolveRepoRoot = (): string => {
  const cwd = process.cwd();
  const segments = cwd.split(path.sep);
  const tail = segments.slice(-2).join("/");
  if (tail === "projects/ops-automation-studio") {
    return path.resolve(cwd, "..", "..");
  }
  return cwd;
};

const repoRoot = resolveRepoRoot();
const workflowPath = path.join(
  repoRoot,
  "projects",
  "ops-automation-studio",
  "workflows",
  "ops-remediation.workflow.json"
);

export const loadOpsRemediationWorkflow = (): OpsWorkflowDefinition => {
  const raw = fs.readFileSync(workflowPath, "utf8");
  return JSON.parse(raw) as OpsWorkflowDefinition;
};

export const runOpsRemediationDemo = async (actor = "ops.runner") => {
  const workflow = loadOpsRemediationWorkflow();
  const toolManifestPath = path.join(repoRoot, "artifacts", "examples", "tool.manifest.sample.json");
  const sandboxPath = path.join(repoRoot, "artifacts", "examples", "execution.sandbox.sample.json");
  const manifest = JSON.parse(fs.readFileSync(toolManifestPath, "utf8")) as ToolManifest;
  const sandboxPolicy = JSON.parse(fs.readFileSync(sandboxPath, "utf8")) as ExecutionSandbox;
  const toolRuntime = new ToolRuntimeExecutor({
    manifest,
    sandboxPolicies: [sandboxPolicy],
    toolHandlers: {
      "tool.write-audit-log": async () => ({
        status: "success",
        output: {
          record_id: `audit-${Date.now()}`,
          stored_at: new Date().toISOString()
        }
      })
    },
    defaultSandboxId: sandboxPolicy.sandbox_id
  });
  const run: RunRecord = {
    run_id: `ops-demo-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "control-plane",
    actor,
    purpose: workflow.description ?? "Ops remediation demo",
    inputs: ["project:ops-automation-studio", "scenario:ops-remediation"],
    outputs: [],
    status: "success",
    trace: {
      trace_id: `trace-${Date.now()}`,
      span_id: `span-${Date.now()}`
    }
  };

  const hitlQueue = createInMemoryHitlQueue();

  const handlers = {
    "collect-context": async () => ({
      status: "success",
      outputs: ["artifact://context/incident-brief.json"]
    }),
    "draft-plan": async () => ({
      status: "success",
      outputs: ["artifact://plans/remediation-plan.md"]
    }),
    "noop": async () => ({
      status: "success",
      outputs: []
    }),
    "apply-change": async () => {
      const toolResult = await toolRuntime.execute({
        request_id: `req-${Date.now()}`,
        run_id: run.run_id,
        tool_id: "tool.write-audit-log",
        requested_at: new Date().toISOString(),
        caller: actor,
        input: {
          run_id: run.run_id,
          event: "ops.change.apply",
          severity: "high"
        },
        trace: {
          trace_id: `trace-${Date.now()}`,
          span_id: `span-${Date.now()}`
        }
      });
      return {
        status: toolResult.status === "success" ? "success" : "failure",
        outputs: [`artifact://tools/${toolResult.result.request_id}.json`]
      };
    },
    "record-audit": async () => ({
      status: "success",
      outputs: ["artifact://audit/audit-entry.json", "tool://tool.write-audit-log"]
    })
  };

  const result = await executeWorkflow(workflow, {}, handlers, run, {
    baseDir: path.join(repoRoot, "artifacts", "runs"),
    hitl: {
      queue: hitlQueue,
      requester: actor,
      playbook_id: "playbook-ops-remediation"
    }
  });

  upsertRun(result.run, { baseDir: path.join(repoRoot, "artifacts", "runs") });

  return {
    run: result.run,
    workflow: result.workflow,
    hitl: hitlQueue
  };
};
