# Run & Artifact Conventions

This document defines how Runs and artifacts are recorded in Mass Relay. Conventions are intended
for deterministic storage, traceability, and future automation.

## Run definition

A **Run** is the atomic unit of observability, cost, quality, and traceability. Every operation
must emit a Run record.

### Required Run metadata

- `run_id`: Unique identifier for the Run (ULID or UUID).
- `timestamp`: ISO-8601 UTC timestamp of Run creation.
- `source`: Execution lane (`control-plane` or `governed-execution`).
- `actor`: Human or system actor responsible for the Run.
- `purpose`: Short description of the operation.
- `inputs`: Deterministic references to inputs or prompts.
- `outputs`: Deterministic references to outputs and artifacts.
- `status`: `success`, `failure`, or `partial`.
- `trace`: Observability metadata (trace/span IDs).

## Run schema

The canonical Run JSON schema lives at `packages/run-model/src/run.schema.json`. All persisted
Run records must validate against this schema and the corresponding TypeScript interface in
`packages/run-model/src/run.ts`.

## Artifact layout

Artifacts live under `artifacts/` and are immutable once written. A future registry will index
artifacts by Run.

Recommended structure:

```
artifacts/
  runs/
    <run_id>/
      run.json
      trace.jsonl
      outputs/
      logs/
  exports/
    runs.jsonl
  examples/
    run.sample.json
    run.export.sample.jsonl
    run.events.sample.json
    run.summary.sample.json
```

## Versioning rules

- Artifacts are append-only and should be stored by Run.
- Updates require a new Run referencing the prior Run as input.
- Each artifact should include a checksum or content hash when possible.

## Known limitations

- Automated enforcement of these conventions will be added in later tracks.
