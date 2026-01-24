# Control Room Runs UI (Read-only)

This directory captures the read-only Control Room surface for Run observability. It is a static
specification and configuration placeholder until the UI track provisions a runnable Next.js
application.

## Scope

- Read-only listing of Runs with filters for status, source, actor, and purpose.
- Detail panel that renders Run metadata, event timeline, and exported artifacts.
- No write-back operations (Control Room remains read-only).

## Data contract

- Run summaries should follow `packages/run-instrumentation/src/run-instrumentation.ts`.
- Event timelines should follow `packages/run-instrumentation/src/run-events.ts`.
- Exported artifacts follow the conventions in `docs/run-artifact-conventions.md`.
