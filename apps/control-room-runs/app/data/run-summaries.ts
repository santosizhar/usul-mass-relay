import runSummariesJson from "./run-summaries.json";

export type RunSummary = {
  run_id: string;
  timestamp: string;
  source: string;
  actor: string;
  purpose: string;
  status:
    | "success"
    | "running"
    | "failed"
    | "canceled"
    | "awaiting_approval"
    | "awaiting_exception"
    | "policy_review";
  trace_id: string;
};

export const runSummaries = runSummariesJson as RunSummary[];
