# Mass Relay — Track Z — Codex Checklist


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
- Final cleanup and hygiene.

## Sprint Z1 — Finalization

Objective:
- Ensure repo consistency and readiness.

Codex tasks:
1. Audit naming and docs links.
2. Ensure review docs exist.
3. Verify build/test from clean checkout.

Constraints:
- No new features

Primary paths:
- docs/**
- packages/**
- apps/**

Acceptance criteria:
- Build passes
- Docs consistent

References:
- All prior tracks
