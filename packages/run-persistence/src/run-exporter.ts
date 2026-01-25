import fs from "fs";
import path from "path";

import { RunRecord } from "../../run-model/src/run";
import { listRunIds, loadRun } from "./run-store";

export interface RunExportOptions {
  baseDir?: string;
  outputPath?: string;
}

const DEFAULT_EXPORT_PATH = path.resolve(
  process.cwd(),
  "artifacts",
  "exports",
  "runs.jsonl"
);

const orderRunRecord = (run: RunRecord): RunRecord => {
  return {
    run_id: run.run_id,
    timestamp: run.timestamp,
    source: run.source,
    actor: run.actor,
    purpose: run.purpose,
    inputs: run.inputs,
    outputs: run.outputs,
    status: run.status,
    trace: run.trace,
    workflow: run.workflow
  };
};

export const exportRunsToJsonl = (options: RunExportOptions = {}): {
  outputPath: string;
  count: number;
} => {
  const outputPath = options.outputPath ?? DEFAULT_EXPORT_PATH;
  const runIds = listRunIds({ baseDir: options.baseDir });

  const lines = runIds.map((runId) => {
    const run = loadRun(runId, { baseDir: options.baseDir });
    return JSON.stringify(orderRunRecord(run));
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${lines.join("\n")}${lines.length ? "\n" : ""}`);

  return { outputPath, count: runIds.length };
};
