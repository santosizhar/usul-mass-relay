import { RunRecord } from "../../run-model/src/run";
import { RunEvent } from "./run-events";

export interface RunSummary {
  run_id: string;
  timestamp: string;
  source: RunRecord["source"];
  actor: string;
  purpose: string;
  status: RunRecord["status"];
  trace_id: string;
}

export const buildRunSummary = (run: RunRecord): RunSummary => {
  return {
    run_id: run.run_id,
    timestamp: run.timestamp,
    source: run.source,
    actor: run.actor,
    purpose: run.purpose,
    status: run.status,
    trace_id: run.trace.trace_id
  };
};

export const orderRunEvents = (events: RunEvent[]): RunEvent[] => {
  return [...events].sort((a, b) => {
    const delta = a.timestamp.localeCompare(b.timestamp);
    if (delta !== 0) {
      return delta;
    }
    return a.event_id.localeCompare(b.event_id);
  });
};
