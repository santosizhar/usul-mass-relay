#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const runSamplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "run.sample.json"
);
const eventsSamplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "run.events.sample.json"
);
const summarySamplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "run.summary.sample.json"
);

const runSample = JSON.parse(fs.readFileSync(runSamplePath, "utf8"));
const eventsSample = JSON.parse(fs.readFileSync(eventsSamplePath, "utf8"));
const summarySample = JSON.parse(fs.readFileSync(summarySamplePath, "utf8"));

const errors = [];

const allowedTypes = new Set(["start", "step", "finish", "failure"]);

if (!Array.isArray(eventsSample) || eventsSample.length === 0) {
  errors.push("Run events sample must be a non-empty array");
}

let lastTimestamp = "";
let lastEventId = "";

eventsSample.forEach((event, index) => {
  if (!event.event_id || !event.run_id || !event.timestamp || !event.type || !event.message) {
    errors.push(`Event ${index} is missing required fields`);
  }
  if (event.run_id !== runSample.run_id) {
    errors.push(`Event ${event.event_id} run_id does not match sample run`);
  }
  if (!allowedTypes.has(event.type)) {
    errors.push(`Event ${event.event_id} has invalid type ${event.type}`);
  }
  if (event.timestamp < lastTimestamp) {
    errors.push(`Event ${event.event_id} is out of order by timestamp`);
  }
  if (event.timestamp === lastTimestamp && event.event_id < lastEventId) {
    errors.push(`Event ${event.event_id} is out of order by event_id`);
  }
  lastTimestamp = event.timestamp;
  lastEventId = event.event_id;
});

const expectedSummary = {
  run_id: runSample.run_id,
  timestamp: runSample.timestamp,
  source: runSample.source,
  actor: runSample.actor,
  purpose: runSample.purpose,
  status: runSample.status,
  trace_id: runSample.trace?.trace_id
};

const normalizedExpected = JSON.stringify(expectedSummary);
const normalizedSummary = JSON.stringify(summarySample);
if (normalizedSummary !== normalizedExpected) {
  errors.push("Run summary sample does not match expected summary");
}

if (errors.length > 0) {
  console.error("Run instrumentation checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Run instrumentation checks passed.");
