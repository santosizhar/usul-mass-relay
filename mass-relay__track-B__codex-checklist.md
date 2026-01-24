# Mass Relay — Track B — Codex Checklist

## Codex Intro Prompt (MANDATORY)

Repo: **mass-relay**

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
- Python = governed execution lane
- Control Room = read-only
- Every operation emits a Run

## B1 — Run model & schemas

Scope:
- Define Run, Span, Event, IO, Cost, Quality core types
- Define Run Envelope v1 JSON schema

Primary paths:
- packages/foundation-observability/src/run/
- packages/foundation-observability/src/schema/

Expected artifacts:
- TypeScript types
- JSON schema v1

References:
- Run principles: MP3

## B2 — Run persistence & exporter

Scope:
- Persist runs to artifacts/runs/<RUN_ID>/run.json
- Maintain append-only run index

Primary paths:
- packages/foundation-observability/src/export/
- artifacts/runs/

Expected artifacts:
- run.json per run
- index.jsonl

References:
- Run envelope spec

## B3 — Instrumentation helpers

Scope:
- startRun / startSpan / endSpan helpers
- Deterministic IDs for regression

Primary paths:
- packages/foundation-observability/src/api/

Expected artifacts:
- Helper APIs
- Basic tests

References:
- OTel-style guidance (conceptual)

## B4 — Control Room runs UI

Scope:
- Read-only runs list
- Run detail view

Primary paths:
- apps/control-room/app/

Expected artifacts:
- Runs UI pages

References:
- Control Room posture: MP3

## B5 — Review

Scope:
- Validate trace consistency
- Add sample runs

Primary paths:
- docs/reviews/
- packages/foundation-observability/fixtures/

Expected artifacts:
- Review doc
- Sample runs

References:
- Roadmap
