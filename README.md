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
