# Run Instrumentation Helpers

This package provides read-only helper utilities for shaping Run observability payloads and
summaries. It is intended for control plane usage and does not persist data.

## Contents

- `src/run-events.ts`: Run event types and interfaces.
- `src/run-instrumentation.ts`: Helpers for summarizing Runs and ordering events.

## Usage notes

- Helpers are deterministic: all IDs and timestamps must be provided by callers.
- Event ordering is strictly chronological to keep exports stable.
