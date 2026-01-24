export type RunEventType = "start" | "step" | "finish" | "failure";

export interface RunEvent {
  event_id: string;
  run_id: string;
  timestamp: string;
  type: RunEventType;
  message: string;
  metadata?: Record<string, string>;
}
