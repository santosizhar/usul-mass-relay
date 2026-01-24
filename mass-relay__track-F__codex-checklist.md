# Mass Relay — Track F — Codex Checklist


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
- Read-only Control Room UI.

## Sprint F1 — UI scaffold

Objective:
- Provide navigable read-only Control Room shell.

Codex tasks:
1. Add layout shell.
2. Add /runs and /playbooks routes.
3. Add empty states.

Constraints:
- No write actions

Primary paths:
- apps/control-room/**

Acceptance criteria:
- Routes load
- No mutations

References:
- MP3 Control Room beta
