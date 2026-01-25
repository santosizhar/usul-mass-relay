import runSummariesJson from "./run-summaries.json";

export type RunSummary = {
  run_id: string;
  timestamp: string;
  source: string;
  actor: string;
  purpose: string;
  status: "success" | "running" | "failed" | "canceled";
  trace_id: string;
  project: string;
};

export const runSummaries = runSummariesJson as RunSummary[];
