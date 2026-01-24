# Mass Relay — Track B — Codex Checklist


## Codex Intro Prompt (MANDATORY)

Repo: mass-relay

Read first:
- MP1__mass-relay__chat1-masterprompt.md
- MP2__mass-relay__chat2-transformer.md
- MP3__mass-relay__executive-summary.md
- mass-relay__roadmap.md

Hard locks:
- Prompt Pack = MP1 / MP2 / MP3 only
- Runtime units = Agent Playbooks
- Foundation ≠ Projects (no cross-imports)
- Control plane = TypeScript
- Python = governed execution lane only
- Control Room = read-only
- Every operation emits a Run

Track specialization:
- Run-centric observability (models, persistence, helpers, UI surfacing).

## Sprint B1 — Run model & schemas

Objective:
- Establish the canonical Run Envelope v1 data model and validator.

Codex tasks:
1. Define TypeScript types for RunEnvelopeV1, including header, spans, events, IO, cost, and quality.
2. Define a stable RunId format and helper generator.
3. Create a JSON Schema v1 that mirrors the TS types exactly.
4. Implement a validator that returns structured, human-readable errors.
5. Add unit tests validating one correct and one incorrect run envelope.

Constraints:
- No persistence or exporters in this sprint
- No UI changes

Primary paths:
- packages/foundation-observability/src/run/**
- packages/foundation-observability/src/schema/**
- packages/foundation-observability/test/**

Acceptance criteria:
- Valid run envelope passes validation
- Invalid envelope fails with clear error messages
- All types compile and are exported

References:
- docs/contracts/run-envelope-v1.md
- MP3 observability posture

## Sprint B2 — Run persistence & exporter

Objective:
- Persist Run envelopes deterministically to local artifacts for inspection and UI use.

Codex tasks:
1. Implement a file exporter that writes artifacts/runs/<RUN_ID>/run.json for each completed run.
2. Ensure exporter is idempotent for the same RUN_ID.
3. Create an append-only index.jsonl with runId, timestamps, status, project.
4. Implement a reader that lists runs using only the index.
5. Add tests creating multiple runs and verifying file structure and index contents.

Constraints:
- No database usage
- No UI work
- Local filesystem only

Primary paths:
- packages/foundation-observability/src/export/**
- packages/foundation-observability/src/index/**
- artifacts/runs/**

Acceptance criteria:
- Each run produces one run.json under its own folder
- index.jsonl lists all runs deterministically
- Exporter tests pass

References:
- B1 Run Envelope schema
