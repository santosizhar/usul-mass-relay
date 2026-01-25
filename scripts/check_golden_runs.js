#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const runsDir = path.join(repoRoot, "artifacts", "runs");
const goldenPath = path.join(repoRoot, "artifacts", "exports", "runs.golden.jsonl");
const sampleExportPath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "run.export.sample.jsonl"
);

const listRunIds = () => {
  if (!fs.existsSync(runsDir)) {
    return [];
  }

  return fs
    .readdirSync(runsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
};

const orderRunRecord = (run) => ({
  run_id: run.run_id,
  timestamp: run.timestamp,
  source: run.source,
  actor: run.actor,
  purpose: run.purpose,
  inputs: run.inputs,
  outputs: run.outputs,
  status: run.status,
  trace: run.trace
});

const loadRun = (runId) => {
  const runPath = path.join(runsDir, runId, "run.json");
  return JSON.parse(fs.readFileSync(runPath, "utf8"));
};

const runIds = listRunIds();
const exportLines = runIds.map((runId) => {
  const run = loadRun(runId);
  return JSON.stringify(orderRunRecord(run));
});

const exported = `${exportLines.join("\n")}${exportLines.length ? "\n" : ""}`;

const golden = fs.readFileSync(goldenPath, "utf8");
const errors = [];

if (exportLines.length === 0) {
  errors.push("No run records found to export.");
}

if (golden !== exported) {
  errors.push("Golden run export does not match exported runs.");
}

const goldenLines = golden.split("\n").filter((line) => line.trim().length > 0);
const sampleLines = fs
  .readFileSync(sampleExportPath, "utf8")
  .split("\n")
  .filter((line) => line.trim().length > 0);

if (sampleLines.length === 0) {
  errors.push("Sample run export file is empty.");
} else if (goldenLines[0] !== sampleLines[0]) {
  errors.push("Sample run export does not match the golden run export.");
}

if (errors.length > 0) {
  console.error("Golden run checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Golden run checks passed.");
