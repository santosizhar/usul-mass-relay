# Mass Relay — Track H — Codex Checklist


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
- Reference project exercising the Foundation.

## Sprint H1 — Project config & playbooks

Objective:
- Provide reference configs and playbooks for validation.

Codex tasks:
1. Define project manifest.
2. Add read-only playbooks.
3. Ensure registry and UI load them.

Constraints:
- No write-back

Primary paths:
- projects/ops-automation-studio/**

Acceptance criteria:
- Playbooks load
- Visible in UI

References:
- Track C registry
