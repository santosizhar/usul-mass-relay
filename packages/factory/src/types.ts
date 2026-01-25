export type FactoryObjectType =
  | "document"
  | "record"
  | "task"
  | "workflow_run"
  | "ai_request"
  | "ai_response"
  | "insight"
  | "evaluation_result";

export type SchemaVersion = "1.0.0";

export interface BaseFactoryObject {
  object_type: FactoryObjectType;
  schema_version: SchemaVersion;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface Document extends BaseFactoryObject {
  object_type: "document";
  document_id: string;
  title: string;
  source: string;
  content: string;
  content_type: "text/plain" | "text/markdown" | "text/html" | "application/pdf";
  checksum: string;
  tags?: string[];
}

export interface RecordObject extends BaseFactoryObject {
  object_type: "record";
  record_id: string;
  record_type: string;
  source_record_id: string;
  attributes: Record<string, unknown>;
  status: "active" | "archived";
}

export interface Task extends BaseFactoryObject {
  object_type: "task";
  task_id: string;
  title: string;
  status: "pending" | "in_progress" | "blocked" | "completed" | "failed";
  priority: "low" | "medium" | "high" | "urgent";
  assignee_id?: string;
  due_at?: string;
  summary?: string;
  related_refs?: string[];
}

export interface WorkflowStep {
  step_id: string;
  name: string;
  status: "queued" | "running" | "success" | "failure" | "skipped";
  started_at?: string;
  finished_at?: string;
  output_refs?: string[];
}

export interface WorkflowRun extends BaseFactoryObject {
  object_type: "workflow_run";
  workflow_run_id: string;
  workflow_id: string;
  status: "queued" | "running" | "success" | "failure" | "canceled";
  trigger: "event" | "schedule" | "manual";
  started_at?: string;
  finished_at?: string;
  steps: WorkflowStep[];
}

export interface AIRequest extends BaseFactoryObject {
  object_type: "ai_request";
  ai_request_id: string;
  requester_id: string;
  model: string;
  prompt: string;
  parameters: Record<string, unknown>;
  requested_at: string;
  input_refs: string[];
  trace?: {
    trace_id: string;
    span_id: string;
  };
}

export interface AIResponse extends BaseFactoryObject {
  object_type: "ai_response";
  ai_response_id: string;
  ai_request_id: string;
  model: string;
  responded_at: string;
  output_text: string;
  tool_calls?: Array<Record<string, unknown>>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Insight extends BaseFactoryObject {
  object_type: "insight";
  insight_id: string;
  subject_ref: string;
  summary: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  evidence_refs: string[];
  generated_at: string;
}

export interface EvaluationMetric {
  metric: string;
  value: number;
  unit?: string;
}

export interface EvaluationResult extends BaseFactoryObject {
  object_type: "evaluation_result";
  evaluation_result_id: string;
  target_ref: string;
  evaluator_id: string;
  score: number;
  score_range: {
    min: number;
    max: number;
  };
  passed: boolean;
  evaluated_at: string;
  rubric?: string;
  metrics?: EvaluationMetric[];
  notes?: string;
}

export type FactoryObject =
  | Document
  | RecordObject
  | Task
  | WorkflowRun
  | AIRequest
  | AIResponse
  | Insight
  | EvaluationResult;
