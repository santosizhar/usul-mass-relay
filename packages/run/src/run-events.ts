export type RunEventType = "start" | "step" | "finish" | "failure";

export interface RunEvent {
  event_id: string;
  run_id: string;
  timestamp: string;
  type: RunEventType;
  message: string;
  metadata?: Record<string, string>;
}

export type TraceEventCategory = "workflow" | "agent" | "tool";

export interface TraceEvent {
  event_id: string;
  run_id: string;
  timestamp: string;
  category: TraceEventCategory;
  action: string;
  status?: "start" | "success" | "failure";
  message?: string;
  metadata?: Record<string, string>;
}
