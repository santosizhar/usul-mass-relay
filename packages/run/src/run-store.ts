import fs from "fs";
import path from "path";

import { RunRecord } from "./run";

export interface RunStoreOptions {
  baseDir?: string;
}

const DEFAULT_RUNS_DIR = path.resolve(process.cwd(), "artifacts", "runs");

export const getRunDir = (runId: string, baseDir = DEFAULT_RUNS_DIR): string => {
  return path.join(baseDir, runId);
};

export const persistRun = (run: RunRecord, options: RunStoreOptions = {}): string => {
  const baseDir = options.baseDir ?? DEFAULT_RUNS_DIR;
  const runDir = getRunDir(run.run_id, baseDir);
  const runFile = path.join(runDir, "run.json");

  if (fs.existsSync(runFile)) {
    throw new Error(`Run already exists at ${runFile}`);
  }

  fs.mkdirSync(path.join(runDir, "outputs"), { recursive: true });
  fs.mkdirSync(path.join(runDir, "logs"), { recursive: true });
  fs.writeFileSync(runFile, `${JSON.stringify(run, null, 2)}\n`, "utf8");

  return runDir;
};

export const updateRun = (run: RunRecord, options: RunStoreOptions = {}): string => {
  const baseDir = options.baseDir ?? DEFAULT_RUNS_DIR;
  const runDir = getRunDir(run.run_id, baseDir);
  const runFile = path.join(runDir, "run.json");

  if (!fs.existsSync(runFile)) {
    throw new Error(`Run does not exist at ${runFile}`);
  }

  fs.writeFileSync(runFile, `${JSON.stringify(run, null, 2)}\n`, "utf8");

  return runDir;
};

export const upsertRun = (run: RunRecord, options: RunStoreOptions = {}): string => {
  const baseDir = options.baseDir ?? DEFAULT_RUNS_DIR;
  const runDir = getRunDir(run.run_id, baseDir);
  const runFile = path.join(runDir, "run.json");

  if (fs.existsSync(runFile)) {
    return updateRun(run, options);
  }

  return persistRun(run, options);
};

export const loadRun = (runId: string, options: RunStoreOptions = {}): RunRecord => {
  const baseDir = options.baseDir ?? DEFAULT_RUNS_DIR;
  const runFile = path.join(getRunDir(runId, baseDir), "run.json");

  const contents = fs.readFileSync(runFile, "utf8");
  return JSON.parse(contents) as RunRecord;
};

export const listRunIds = (options: RunStoreOptions = {}): string[] => {
  const baseDir = options.baseDir ?? DEFAULT_RUNS_DIR;

  if (!fs.existsSync(baseDir)) {
    return [];
  }

  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
};
