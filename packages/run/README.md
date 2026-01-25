# Run

Unified Run record contracts, instrumentation helpers, and file-based persistence utilities.

## Contents

- Run model: `src/run.ts`, `src/run.schema.json`
- Run events: `src/run-events.ts`, `src/run-instrumentation.ts`
- Run persistence: `src/run-store.ts`, `src/run-exporter.ts`
- Run storage records: `src/run-storage.ts`, `src/run-storage.schema.json`

## Usage notes

- Run records are immutable once written; use `persistRun` for initial writes.
- Event ordering helpers live in `run-instrumentation.ts` for deterministic exports.
