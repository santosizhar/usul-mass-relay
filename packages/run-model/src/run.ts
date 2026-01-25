export type RunSource = "control-plane" | "governed-execution";
export type RunStatus = "success" | "failure" | "partial";
export type WorkflowRunStatus = "pending" | "running" | "waiting_hitl" | "success" | "failure" | "partial";
export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "waiting_hitl"
  | "success"
  | "failure"
  | "skipped";

export interface RunTrace {
  trace_id: string;
  span_id: string;
}

export interface WorkflowStepRecord {
  step_id: string;
  status: WorkflowStepStatus;
  attempts: number;
  started_at?: string;
  completed_at?: string;
  outputs?: string[];
  last_error?: string;
  hitl_request_id?: string;
}

export interface WorkflowRunRecord {
  workflow_id: string;
  status: WorkflowRunStatus;
  started_at: string;
  completed_at?: string;
  steps: WorkflowStepRecord[];
}

export interface RunRecord {
  run_id: string;
  timestamp: string;
  source: RunSource;
  actor: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  status: RunStatus;
  trace: RunTrace;
  workflow?: WorkflowRunRecord;
}
