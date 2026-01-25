import runEventsJson from "./run-events.json";

export type RunEvent = {
  event_id: string;
  run_id: string;
  timestamp: string;
  type: "start" | "step" | "finish" | "failure";
  message: string;
  metadata?: Record<string, string>;
};

export const runEvents = runEventsJson as RunEvent[];
