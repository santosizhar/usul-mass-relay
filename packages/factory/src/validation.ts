import {
  AIRequest,
  AIResponse,
  Document,
  EvaluationResult,
  FactoryObject,
  FactoryObjectType,
  Insight,
  RecordObject,
  Task,
  WorkflowRun,
} from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const ID_PATTERN = /^[0-9A-Z]{26}$|^[0-9a-fA-F-]{36}$/;
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const SCHEMA_VERSION = "1.0.0";

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const ensureString = (value: unknown, field: string, errors: string[], minLength = 1): void => {
  if (typeof value !== "string" || value.length < minLength) {
    errors.push(`${field} must be a non-empty string`);
  }
};

const ensureStringArray = (value: unknown, field: string, errors: string[]): void => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    errors.push(`${field} must be an array of strings`);
  }
};

const ensureDateTime = (value: unknown, field: string, errors: string[]): void => {
  if (typeof value !== "string" || !ISO_DATE_TIME_PATTERN.test(value)) {
    errors.push(`${field} must be an ISO 8601 UTC timestamp`);
  }
};

const ensureEnum = (value: unknown, field: string, allowed: readonly string[], errors: string[]): void => {
  if (typeof value !== "string" || !allowed.includes(value)) {
    errors.push(`${field} must be one of: ${allowed.join(", ")}`);
  }
};

const ensureId = (value: unknown, field: string, errors: string[]): void => {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    errors.push(`${field} must be a ULID or UUID`);
  }
};

const ensureNumber = (value: unknown, field: string, errors: string[]): void => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    errors.push(`${field} must be a number`);
  }
};

const ensureOptionalString = (value: unknown, field: string, errors: string[]): void => {
  if (value !== undefined && typeof value !== "string") {
    errors.push(`${field} must be a string when provided`);
  }
};

const ensureOptionalDateTime = (value: unknown, field: string, errors: string[]): void => {
  if (value !== undefined) {
    ensureDateTime(value, field, errors);
  }
};

const ensureObjectType = (value: unknown, field: string, errors: string[]): void => {
  if (!isObject(value)) {
    errors.push(`${field} must be an object`);
  }
};

const ensureMetadata = (value: unknown, field: string, errors: string[]): void => {
  if (value !== undefined && !isObject(value)) {
    errors.push(`${field} must be an object when provided`);
  }
};

const validateBase = (
  data: Partial<FactoryObject>,
  objectType: FactoryObjectType,
  errors: string[],
): void => {
  ensureEnum(data.object_type, "object_type", [objectType], errors);
  ensureEnum(data.schema_version, "schema_version", [SCHEMA_VERSION], errors);
  ensureDateTime(data.created_at, "created_at", errors);
  ensureDateTime(data.updated_at, "updated_at", errors);
  ensureMetadata(data.metadata, "metadata", errors);
};

export const validateDocument = (data: Document): ValidationResult => {
  const errors: string[] = [];
  validateBase(data, "document", errors);
  ensureId(data.document_id, "document_id", errors);
  ensureString(data.title, "title", errors);
  ensureString(data.source, "source", errors);
  ensureString(data.content, "content", errors);
  ensureEnum(data.content_type, "content_type", [
    "text/plain",
    "text/markdown",
    "text/html",
    "application/pdf",
  ], errors);
  ensureString(data.checksum, "checksum", errors);
  if (data.tags !== undefined) {
    ensureStringArray(data.tags, "tags", errors);
  }
  return { valid: errors.length === 0, errors };
};

export const validateRecord = (data: RecordObject): ValidationResult => {
  const errors: string[] = [];
  validateBase(data, "record", errors);
  ensureId(data.record_id, "record_id", errors);
  ensureString(data.record_type, "record_type", errors);
  ensureString(data.source_record_id, "source_record_id", errors);
  ensureObjectType(data.attributes, "attributes", errors);
  ensureEnum(data.status, "status", ["active", "archived"], errors);
  return { valid: errors.length === 0, errors };
};

export const validateTask = (data: Task): ValidationResult => {
  const errors: string[] = [];
  validateBase(data, "task", errors);
  ensureId(data.task_id, "task_id", errors);
  ensureString(data.title, "title", errors);
  ensureEnum(data.status, "status", [
    "pending",
    "in_progress",
    "blocked",
    "completed",
    "failed",
  ], errors);
  ensureEnum(data.priority, "priority", ["low", "medium", "high", "urgent"], errors);
  ensureOptionalString(data.assignee_id, "assignee_id", errors);
  ensureOptionalDateTime(data.due_at, "due_at", errors);
  ensureOptionalString(data.summary, "summary", errors);
  if (data.related_refs !== undefined) {
    ensureStringArray(data.related_refs, "related_refs", errors);
  }
  return { valid: errors.length === 0, errors };
};

export const validateWorkflowRun = (data: WorkflowRun): ValidationResult => {
  const errors: string[] = [];
  validateBase(data, "workflow_run", errors);
  ensureId(data.workflow_run_id, "workflow_run_id", errors);
  ensureId(data.workflow_id, "workflow_id", errors);
  ensureEnum(data.status, "status", ["queued", "running", "success", "failure", "canceled"], errors);
  ensureEnum(data.trigger, "trigger", ["event", "schedule", "manual"], errors);
  ensureOptionalDateTime(data.started_at, "started_at", errors);
  ensureOptionalDateTime(data.finished_at, "finished_at", errors);
  if (!Array.isArray(data.steps)) {
    errors.push("steps must be an array");
  } else {
    data.steps.forEach((step, index) => {
      if (!step) {
        errors.push(`steps[${index}] must be an object`);
        return;
      }
      ensureId(step.step_id, `steps[${index}].step_id`, errors);
      ensureString(step.name, `steps[${index}].name`, errors);
      ensureEnum(step.status, `steps[${index}].status`, [
        "queued",
        "running",
        "success",
        "failure",
        "skipped",
      ], errors);
      ensureOptionalDateTime(step.started_at, `steps[${index}].started_at`, errors);
      ensureOptionalDateTime(step.finished_at, `steps[${index}].finished_at`, errors);
      if (step.output_refs !== undefined) {
        ensureStringArray(step.output_refs, `steps[${index}].output_refs`, errors);
      }
    });
  }
  return { valid: errors.length === 0, errors };
};

export const validateAIRequest = (data: AIRequest): ValidationResult => {
  const errors: string[] = [];
  validateBase(data, "ai_request", errors);
  ensureId(data.ai_request_id, "ai_request_id", errors);
  ensureString(data.requester_id, "requester_id", errors);
  ensureString(data.model, "model", errors);
  ensureString(data.prompt, "prompt", errors);
  ensureObjectType(data.parameters, "parameters", errors);
  ensureDateTime(data.requested_at, "requested_at", errors);
  ensureStringArray(data.input_refs, "input_refs", errors);
  if (data.trace !== undefined) {
    ensureString(data.trace.trace_id, "trace.trace_id", errors);
    ensureString(data.trace.span_id, "trace.span_id", errors);
  }
  return { valid: errors.length === 0, errors };
};

export const validateAIResponse = (data: AIResponse): ValidationResult => {
  const errors: string[] = [];
  validateBase(data, "ai_response", errors);
  ensureId(data.ai_response_id, "ai_response_id", errors);
  ensureId(data.ai_request_id, "ai_request_id", errors);
  ensureString(data.model, "model", errors);
  ensureDateTime(data.responded_at, "responded_at", errors);
  ensureString(data.output_text, "output_text", errors);
  if (data.tool_calls !== undefined && !Array.isArray(data.tool_calls)) {
    errors.push("tool_calls must be an array when provided");
  }
  if (data.usage !== undefined) {
    ensureNumber(data.usage.prompt_tokens, "usage.prompt_tokens", errors);
    ensureNumber(data.usage.completion_tokens, "usage.completion_tokens", errors);
    ensureNumber(data.usage.total_tokens, "usage.total_tokens", errors);
  }
  return { valid: errors.length === 0, errors };
};

export const validateInsight = (data: Insight): ValidationResult => {
  const errors: string[] = [];
  validateBase(data, "insight", errors);
  ensureId(data.insight_id, "insight_id", errors);
  ensureString(data.subject_ref, "subject_ref", errors);
  ensureString(data.summary, "summary", errors);
  ensureEnum(data.severity, "severity", ["info", "low", "medium", "high", "critical"], errors);
  ensureStringArray(data.evidence_refs, "evidence_refs", errors);
  ensureDateTime(data.generated_at, "generated_at", errors);
  return { valid: errors.length === 0, errors };
};

export const validateEvaluationResult = (data: EvaluationResult): ValidationResult => {
  const errors: string[] = [];
  validateBase(data, "evaluation_result", errors);
  ensureId(data.evaluation_result_id, "evaluation_result_id", errors);
  ensureString(data.target_ref, "target_ref", errors);
  ensureString(data.evaluator_id, "evaluator_id", errors);
  ensureNumber(data.score, "score", errors);
  if (!isObject(data.score_range)) {
    errors.push("score_range must be an object");
  } else {
    ensureNumber(data.score_range.min, "score_range.min", errors);
    ensureNumber(data.score_range.max, "score_range.max", errors);
  }
  if (typeof data.passed !== "boolean") {
    errors.push("passed must be a boolean");
  }
  ensureDateTime(data.evaluated_at, "evaluated_at", errors);
  ensureOptionalString(data.rubric, "rubric", errors);
  if (data.metrics !== undefined) {
    if (!Array.isArray(data.metrics)) {
      errors.push("metrics must be an array when provided");
    } else {
      data.metrics.forEach((metric, index) => {
        ensureString(metric.metric, `metrics[${index}].metric`, errors);
        ensureNumber(metric.value, `metrics[${index}].value`, errors);
        ensureOptionalString(metric.unit, `metrics[${index}].unit`, errors);
      });
    }
  }
  ensureOptionalString(data.notes, "notes", errors);
  return { valid: errors.length === 0, errors };
};

export const validateFactoryObject = (data: FactoryObject): ValidationResult => {
  switch (data.object_type) {
    case "document":
      return validateDocument(data);
    case "record":
      return validateRecord(data);
    case "task":
      return validateTask(data);
    case "workflow_run":
      return validateWorkflowRun(data);
    case "ai_request":
      return validateAIRequest(data);
    case "ai_response":
      return validateAIResponse(data);
    case "insight":
      return validateInsight(data);
    case "evaluation_result":
      return validateEvaluationResult(data);
    default:
      return { valid: false, errors: ["Unsupported object_type"] };
  }
};
