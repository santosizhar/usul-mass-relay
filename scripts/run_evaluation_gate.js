#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

const defaultDatasetPath = path.join(
  repoRoot,
  "artifacts",
  "evaluations",
  "baseline.golden.json"
);
const defaultReportPath = path.join(
  repoRoot,
  "artifacts",
  "exports",
  "evaluation-baseline.report.json"
);

const datasetPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultDatasetPath;
const reportPath = process.argv[3] ? path.resolve(process.argv[3]) : defaultReportPath;

const loadTraceEvents = (runId) => {
  const tracePath = path.join(repoRoot, "artifacts", "runs", runId, "trace.jsonl");
  if (!fs.existsSync(tracePath)) {
    return [];
  }
  return fs
    .readFileSync(tracePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
};

const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
const results = dataset.runs.map((run) => {
  const events = loadTraceEvents(run.run_id);
  const counts = events.reduce(
    (acc, event) => {
      const category = event.category;
      if (category && Object.prototype.hasOwnProperty.call(acc, category)) {
        acc[category] += 1;
      }
      return acc;
    },
    { workflow: 0, agent: 0, tool: 0 }
  );

  const expected = run.expected;
  const passed =
    counts.workflow === expected.workflow &&
    counts.agent === expected.agent &&
    counts.tool === expected.tool;

  return {
    run_id: run.run_id,
    expected,
    observed: counts,
    passed
  };
});

const report = {
  dataset_id: dataset.dataset_id,
  evaluated_at: new Date().toISOString(),
  passed: results.every((result) => result.passed),
  results
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (!report.passed) {
  console.error("Evaluation gate failed.");
  results.forEach((result) => {
    if (!result.passed) {
      console.error(
        `- ${result.run_id}: expected ${JSON.stringify(result.expected)}, observed ${JSON.stringify(
          result.observed
        )}`
      );
    }
  });
  process.exit(1);
}

console.log(`Evaluation gate passed. Report written to ${path.relative(repoRoot, reportPath)}`);
