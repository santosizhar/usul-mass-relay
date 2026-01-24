# Mass Relay — Track D — Codex Checklist


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
- Governed Python execution lane.

## Sprint D1 — Tool manifest & contract

Objective:
- Define how tools are described and invoked safely.

Codex tasks:
1. Define tool manifest JSON schema.
2. Define TS ToolRequest/ToolResponse types.
3. Add validation and error mapping.
4. Document the contract.

Constraints:
- No python runner yet

Primary paths:
- packages/foundation-execution/**
- docs/contracts/**

Acceptance criteria:
- Schema validates
- Docs exist

References:
- MP3 execution posture
