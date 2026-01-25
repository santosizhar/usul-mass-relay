const fs = require("fs");
const path = require("path");

const runTablePath = path.join(
  __dirname,
  "..",
  "apps",
  "control-room-runs",
  "config",
  "run-table.json"
);
const runSummariesPath = path.join(
  __dirname,
  "..",
  "apps",
  "control-room-runs",
  "app",
  "data",
  "run-summaries.json"
);
const runEventsPath = path.join(
  __dirname,
  "..",
  "apps",
  "control-room-runs",
  "app",
  "data",
  "run-events.json"
);
const runArtifactsPath = path.join(
  __dirname,
  "..",
  "apps",
  "control-room-runs",
  "app",
  "data",
  "run-artifacts.json"
);

const runTable = JSON.parse(fs.readFileSync(runTablePath, "utf8"));
const runSummaries = JSON.parse(fs.readFileSync(runSummariesPath, "utf8"));
const runEvents = JSON.parse(fs.readFileSync(runEventsPath, "utf8"));
const runArtifacts = JSON.parse(fs.readFileSync(runArtifactsPath, "utf8"));

if (!Array.isArray(runSummaries) || runSummaries.length === 0) {
  throw new Error("Run summaries must be a non-empty array.");
}

const sample = runSummaries[0];
const columnKeys = runTable.columns.map((column) => column.key);
const filterKeys = runTable.filters.map((filter) => filter.key);

const missingColumnKeys = columnKeys.filter((key) => !(key in sample));
if (missingColumnKeys.length > 0) {
  throw new Error(`Run summaries missing columns: ${missingColumnKeys.join(", ")}`);
}

const missingFilterKeys = filterKeys.filter((key) => !(key in sample));
if (missingFilterKeys.length > 0) {
  throw new Error(`Run summaries missing filters: ${missingFilterKeys.join(", ")}`);
}

const statusValues = new Set(runSummaries.map((run) => run.status));
const allowedStatuses = new Set(["success", "running", "failed", "canceled"]);
const unexpectedStatuses = [...statusValues].filter(
  (status) => !allowedStatuses.has(status)
);

if (unexpectedStatuses.length > 0) {
  throw new Error(`Unexpected status values: ${unexpectedStatuses.join(", ")}`);
}

const runIds = new Set(runSummaries.map((run) => run.run_id));

if (!Array.isArray(runEvents) || runEvents.length === 0) {
  throw new Error("Run events must be a non-empty array.");
}

const allowedEventTypes = new Set(["start", "step", "finish", "failure"]);
const invalidEventRuns = runEvents.filter((event) => !runIds.has(event.run_id));
if (invalidEventRuns.length > 0) {
  throw new Error("Run events reference unknown run IDs.");
}
const invalidEventTypes = runEvents.filter((event) => !allowedEventTypes.has(event.type));
if (invalidEventTypes.length > 0) {
  throw new Error("Run events include unsupported event types.");
}

if (!Array.isArray(runArtifacts) || runArtifacts.length === 0) {
  throw new Error("Run artifacts must be a non-empty array.");
}

const invalidArtifactRuns = runArtifacts.filter((bundle) => !runIds.has(bundle.run_id));
if (invalidArtifactRuns.length > 0) {
  throw new Error("Run artifacts reference unknown run IDs.");
}
runArtifacts.forEach((bundle) => {
  if (!Array.isArray(bundle.inputs) || !Array.isArray(bundle.outputs)) {
    throw new Error(`Run artifact bundle missing inputs/outputs for ${bundle.run_id}.`);
  }
});

console.log("Control Room runs UI configuration check passed.");
