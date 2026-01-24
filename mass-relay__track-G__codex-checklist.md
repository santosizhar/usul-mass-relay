# Mass Relay — Track G — Codex Checklist


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
- Testing and regression baseline.

## Sprint G1 — Schema tests

Objective:
- Validate all schemas via automated tests.

Codex tasks:
1. Add schema test harness.
2. Test run, playbook, and tool schemas.

Constraints:
- No new schemas

Primary paths:
- packages/foundation-testing/**

Acceptance criteria:
- Tests pass
- Clear failures

References:
- Tracks B/C/D schemas
