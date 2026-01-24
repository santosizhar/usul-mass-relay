export type RunSource = "control-plane" | "governed-execution";
export type RunStatus = "success" | "failure" | "partial";

export interface RunTrace {
  trace_id: string;
  span_id: string;
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
}
