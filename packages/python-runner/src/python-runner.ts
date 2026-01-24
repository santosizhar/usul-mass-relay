export type GovernanceLevel = "A0" | "A1" | "A2" | "A3";

export type PythonRunnerStatus = "success" | "failure";

export interface PythonRunnerGovernance {
  level: GovernanceLevel;
  requires_hitl: boolean;
  requires_run_logging: boolean;
}

export interface PythonRunnerTrace {
  trace_id: string;
  span_id: string;
}

export interface PythonRunnerRequest {
  request_id: string;
  run_id: string;
  tool_id: string;
  tool_version: string;
  requested_at: string;
  caller: string;
  input: Record<string, unknown>;
  governance: PythonRunnerGovernance;
  trace: PythonRunnerTrace;
  timeout_seconds: number;
}

export interface PythonRunnerError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface PythonRunnerResponse {
  request_id: string;
  run_id: string;
  tool_id: string;
  tool_version: string;
  status: PythonRunnerStatus;
  started_at: string;
  finished_at: string;
  output: Record<string, unknown>;
  error?: PythonRunnerError;
  trace: PythonRunnerTrace;
}
