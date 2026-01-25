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
export type FactoryObjectKind =
  | "dataset"
  | "entity"
  | "event"
  | "document"
  | "metric";

export interface FactoryObjectLineage {
  upstream_object_ids: string[];
  downstream_object_ids: string[];
  run_id: string;
}

export interface FactoryObject {
  object_id: string;
  kind: FactoryObjectKind;
  name: string;
  description?: string;
  source_system: string;
  source_uri: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  attributes: Record<string, unknown>;
  lineage?: FactoryObjectLineage;
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
