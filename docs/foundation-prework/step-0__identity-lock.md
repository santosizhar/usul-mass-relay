# Step 0 — Project Identity Lock (FINAL)

## Locked Project Identity

- project_name: Mass Relay
- project_slug: mass-relay
- repo_name: mass-relay
- prompt_namespace: mass-relay

## Scope Clarification (Authoritative)

- Mass Relay is both the internal engineering name and the external-facing product name.
- The repository is a monorepo containing:
  - the Foundation (shared, normalized platform capabilities)
  - one selected Project developed alongside the Foundation to validate and pressure-test it
- Foundation is a strict layer:
  - Projects may not bypass it.
  - No project-local redefinitions of Foundation concerns.
  - Missing capabilities must be elevated into Foundation rather than implemented as project hacks.

## Prompt Pack Scope & Lifecycle (Resolved)

- Chat 1 prompt packs may cover two scopes:
  1) Foundation-scoped prompt assets (reusable, normalized, cross-project).
  2) One Project-scoped prompt asset set for the single co-developed project (explicitly selected later).

- Prompt packs are versioned with Foundation deliverables while the project is in incubation.
