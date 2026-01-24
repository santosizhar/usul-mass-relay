# Mass Relay — Track C — Codex Checklist


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
- Governance, policies, HITL, playbook registry.

## Sprint C1 — Playbook schema

Objective:
- Define and validate Agent Playbook JSON schema v1.

Codex tasks:
1. Define playbook schema fields (id, version, steps, tools).
2. Implement schema validator.
3. Add example playbooks in ops-automation project.
4. Add tests for valid/invalid playbooks.

Constraints:
- No execution

Primary paths:
- packages/foundation-governance/**
- projects/ops-automation-studio/playbooks/**

Acceptance criteria:
- Playbooks validate
- Tests pass

References:
- MP1 terminology lock
