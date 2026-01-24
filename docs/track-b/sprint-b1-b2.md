# Track B — Sprints B1 & B2

This document summarizes the Track B deliverables implemented in sprints B1 and B2.

## Sprint B1 — Run model & schemas

Artifacts:
- Run record TypeScript interface in `packages/run-model/src/run.ts`.
- Run JSON schema in `packages/run-model/src/run.schema.json`.
- Validation sample Run record in `artifacts/examples/run.sample.json`.

Checks:
- `scripts/check_run_artifacts.js` validates Run records against the schema.

## Sprint B2 — Run persistence & exporter

Artifacts:
- File-based Run persistence helpers in `packages/run-persistence/src/run-store.ts`.
- JSONL export helper in `packages/run-persistence/src/run-exporter.ts`.
- Persisted Run example in `artifacts/runs/01J8Y3H9ZV3EN8R1B0C1R2D3E4/run.json`.
- Run export sample in `artifacts/examples/run.export.sample.jsonl`.

Checks:
- `scripts/check_run_artifacts.js` validates the persisted Run and export sample.

## Known limitations

- Persistence helpers are reference implementations without a backing datastore.
- JSONL export snapshots are generated via file traversal and are intended for batch use only.
