# Mass Relay — Track A — Codex Checklist


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
- Repo scaffolding, contracts, and boundary enforcement.

## Sprint A1 — Repo initialization

Objective:
- Create a buildable greenfield monorepo matching locked layout.

Codex tasks:
1. Create apps/, packages/, projects/, docs/, artifacts/ directories.
2. Scaffold a buildable TypeScript workspace with root configs.
3. Create empty Control Room Next.js app.
4. Create empty Foundation packages with index.ts exports.

Constraints:
- No project logic
- No Python

Primary paths:
- apps/**
- packages/**
- docs/**
- projects/**
- artifacts/**

Acceptance criteria:
- Repo builds
- Control Room app starts

References:
- MP1 layout lock
