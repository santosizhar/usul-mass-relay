# Track B — Sprints B3 & B4

This document summarizes the Track B deliverables implemented in sprints B3 and B4.

## Sprint B3 — Instrumentation helpers

Artifacts:
- Run event contracts in `packages/run/src/run-events.ts`.
- Run summary and event ordering helpers in `packages/run/src/run-instrumentation.ts`.
- Run event sample in `artifacts/examples/run.events.sample.json`.
- Run summary sample in `artifacts/examples/run.summary.sample.json`.

Checks:
- `scripts/check_run_instrumentation.js` validates run event ordering and summary data.

## Sprint B4 — Control Room runs UI

Artifacts:
- Control Room runs UI specification in `apps/control-room-runs/README.md`.
- Table and filter configuration in `apps/control-room-runs/config/run-table.json`.

## Known limitations

- The Control Room UI is a static specification until UI track work provisions a Next.js app.
- Instrumentation helpers are TypeScript-only utilities without runtime wiring.
