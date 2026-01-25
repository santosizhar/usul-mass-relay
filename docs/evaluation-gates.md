# Evaluation Gates

Evaluation gates validate runs against golden datasets to catch regressions before release. The
baseline gate in this repo compares trace event counts for workflow, agent, and tool categories.

## Baseline gate setup

- Golden dataset: `artifacts/evaluations/baseline.golden.json`
- Regression run: `artifacts/runs/01J8Y3H9ZV3EN8R1B0C1R2D3E5/run.json`
- Trace events: `artifacts/runs/01J8Y3H9ZV3EN8R1B0C1R2D3E5/trace.jsonl`

## Running the gate

Run the gate with the Node script:

```bash
node scripts/run_evaluation_gate.js
```

You can provide custom paths:

```bash
node scripts/run_evaluation_gate.js <dataset-path> <report-path>
```

## Outputs

The gate writes a deterministic report that includes pass/fail status and observed counts.

- Baseline report: `artifacts/exports/evaluation-baseline.report.json`

If any run fails the expectations, the script exits non-zero and prints a per-run summary of
expected versus observed counts.
