import fs from "fs";
import path from "path";

import { TraceEvent } from "../../run-instrumentation/src/run-events";
import { getRunDir, RunStoreOptions } from "./run-store";

export interface TraceCollectorOptions extends RunStoreOptions {
  traceFileName?: string;
}

const DEFAULT_TRACE_FILE = "trace.jsonl";

export const getTraceFilePath = (
  runId: string,
  options: TraceCollectorOptions = {}
): string => {
  const baseDir = options.baseDir ?? path.resolve(process.cwd(), "artifacts", "runs");
  const traceFileName = options.traceFileName ?? DEFAULT_TRACE_FILE;
  return path.join(getRunDir(runId, baseDir), traceFileName);
};

export const loadTraceEvents = (
  runId: string,
  options: TraceCollectorOptions = {}
): TraceEvent[] => {
  const tracePath = getTraceFilePath(runId, options);
  if (!fs.existsSync(tracePath)) {
    return [];
  }
  const lines = fs.readFileSync(tracePath, "utf8").split("\n");
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as TraceEvent);
};

export class TraceCollector {
  private readonly runId: string;
  private readonly tracePath: string;

  constructor(runId: string, options: TraceCollectorOptions = {}) {
    this.runId = runId;
    this.tracePath = getTraceFilePath(runId, options);

    if (!fs.existsSync(path.dirname(this.tracePath))) {
      throw new Error(`Run directory missing for ${runId}`);
    }
  }

  record(event: TraceEvent): void {
    if (event.run_id !== this.runId) {
      throw new Error(`Trace event run_id ${event.run_id} does not match ${this.runId}`);
    }
    const payload = JSON.stringify(event);
    fs.appendFileSync(this.tracePath, `${payload}\n`, "utf8");
  }
}
