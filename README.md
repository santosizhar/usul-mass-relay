# Mass Relay

Mass Relay is an AI Software Factory focused on reusable, governable, and observable AI operations.
This repository is intentionally minimal and establishes the foundational layout, contracts, and
terminology for the project.

## Repository layout

- `apps/`: UI-only applications (Next.js surfaces).
- `packages/`: Foundation modules (shared platform capabilities).
- `projects/`: Reference projects built on top of Foundation modules.
- `docs/`: Documentation, governance, and terminology.
- `artifacts/`: Versioned outputs and snapshots produced by Runs.

## Track A scope

Track A establishes repository contracts, conventions, and governance documentation. The current
sprint coverage includes:

- **A1 — Repo initialization**: base layout, artifacts, and deterministic checks.
- **A2 — Terminology & governance docs**: shared language and policy guardrails.
- **A3 — Run & artifact conventions**: Run metadata and artifact storage rules.
- **A4 — Ops Automation Studio scaffold**: reference project structure for Project A.
- **A5 — Review**: consolidated review of Track A artifacts and gaps.

## Track B scope

Track B introduces Run-centric observability artifacts and reference helpers. The current sprint
coverage includes:

- **B1 — Run model & schemas**: Run record interfaces and JSON schema definitions.
- **B2 — Run persistence & exporter**: file-based Run persistence and deterministic exports.
- **B3 — Instrumentation helpers**: event contracts and summary helpers for Runs.
- **B4 — Control Room runs UI**: read-only UI specification and configuration.
- **B5 — Review**: consolidated review of Track B artifacts and gaps.

## Track D scope

Track D establishes the governed execution lane contracts. The current sprint coverage includes:

- **D1 — Tool manifest & contract**: schema-backed definitions for governed tools.
- **D2 — Python runner**: request/response contracts and a reference runner stub.
- **D3 — Sandboxing & safety**: sandbox policy contracts for governed execution lanes.
- **D4 — Reference tools**: reference tool catalog and deterministic stubs.
- **D5 — Review**: consolidated review of Track D artifacts and gaps.

## Track E scope

Track E defines storage and state interfaces. The current sprint coverage includes:

- **E1 — Storage interfaces**: schema-backed storage metadata and samples.
- **E2 — Run persistence**: run storage metadata and deterministic samples.
- **E3 — Playbook persistence**: playbook storage metadata and deterministic samples.
- **E4 — Project config persistence**: project config storage metadata and deterministic samples.
- **E5 — Review**: Track E review of storage and persistence artifacts.

## Track F scope

Track F provisions the Control Room beta UI surfaces. The current sprint coverage includes:

- **F1 — App scaffold**: Next.js scaffold for the Control Room runs surface.
- **F2 — Runs list**: read-only runs list UI with filters and sample data.
- **F3 — Run detail**: run detail panel with event timeline and artifact references.
- **F4 — Playbook explorer**: read-only explorer for Agent Playbooks.
- **F5 — Review**: consolidated review of Track F artifacts and gaps.

## Guardrails

- Prompt Pack refers only to MP1/MP2/MP3 artifacts.
- Runtime behavior units are Agent Playbooks.
- Foundation modules must not depend on Projects.
- Control plane logic is TypeScript; Python is limited to governed execution lanes.
- Control Room is read-only.
- Every operation emits a Run.

## Limitations

This repository currently provides only structural scaffolding and documentation. No runnable
services are present yet.
