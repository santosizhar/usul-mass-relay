# Mass Relay — Track E — Codex Checklist


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
- Storage interfaces and local persistence.

## Sprint E1 — Storage interfaces

Objective:
- Define storage abstractions without concrete providers.

Codex tasks:
1. Define RunStore, PlaybookStore, ProjectConfigStore interfaces.
2. Document intended persistence model.

Constraints:
- No DB connections

Primary paths:
- packages/foundation-storage/**
- docs/contracts/**

Acceptance criteria:
- Interfaces compile
- Docs exist

References:
- MP3 tech posture
