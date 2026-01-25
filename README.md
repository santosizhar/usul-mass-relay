# Mass Relay

Mass Relay is an AI Software Factory focused on reusable, governable, and observable AI operations.
This repository is intentionally minimal and establishes the foundational layout, contracts, and
terminology for the project.

## Repository layout

- `apps/`: UI-only applications (Next.js surfaces).
- `packages/`: Foundation modules (shared platform capabilities).
- `projects/`: Reference projects built on top of Foundation modules (Ops Automation Studio, Internal Knowledge Assistant).
- `docs/`: Documentation, governance, and terminology.
- `docs/foundation-tracks-development/`: Track checklists, sprint summaries, and roadmap references.
- `artifacts/`: Versioned outputs and snapshots produced by Runs.

For the techstack mapping of Foundation categories to current repo technologies, see
`techstack.md`.

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

## Track C scope

Track C defines governance and Agent Playbook contracts. The current sprint coverage includes:

- **C1 — Playbook schema**: Agent Playbook interfaces, schema, and samples.
- **C2 — Governance policy**: governance ladder definitions and policy samples.
- **C3 — HITL hooks & audit logging**: HITL request and audit log contracts.
- **C4 — Registry & versioning**: governance registry schemas and samples.
- **C5 — Review**: consolidated review of Track C artifacts and gaps.

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

## Track G scope

Track G delivers testing and regression coverage for the foundation contracts. The current sprint
coverage includes:

- **G1 — Schema tests**: deterministic schema validation suite across Foundation modules.
- **G2 — Golden runs**: golden Run export snapshot with regression checks.
- **G3 — TS↔Python contract tests**: contract checks between tool manifests and runner payloads.
- **G4 — Boundary enforcement**: enforcement checks for Foundation vs Project separation.
- **G5 — Review**: consolidated review of Track G artifacts and gaps.

## Track H scope

Track H delivers the Ops Automation Studio reference project. The current sprint coverage includes:

- **H1 — Config & playbooks**: project config, playbook definitions, and deterministic checks.
- **H2 — Governed write-back**: governed execution playbook and workflow definitions.
- **H3 — Mock integrations**: mock integration catalog and deterministic references.
- **H4 — Demo scenarios**: demo scenarios catalog with expected Run outputs.
- **H5 — Review**: Track H review of Ops Automation Studio artifacts and gaps.

## Track Z scope

Track Z finalizes repository conventions and hygiene. The current sprint coverage includes:

- **Z1 — Conventions & hygiene**: consolidated review of documentation, contracts, and integrity checks.

## Status

Mass Relay currently provides execution-grade scaffolding and documentation for Foundation contracts,
governance, the governed execution lane, Control Room UI surfaces, and reference project scaffolds for
Ops Automation Studio and the Internal Knowledge Assistant. Runtime services are not yet wired;
artifacts and checks are deterministic, file-based references pending future integrations.

## Guardrails

- Prompt Pack refers only to MP1/MP2/MP3 artifacts.
- Runtime behavior units are Agent Playbooks.
- Foundation modules must not depend on Projects.
- Control plane logic is TypeScript; Python is limited to governed execution lanes.
- Control Room is read-only.
- Every operation emits a Run.

## Limitations

This repository currently provides mostly structural scaffolding and documentation. A minimal
Foundation service exists for local experimentation but is not production-ready.

## Local Foundation service (thin vertical slice)

The Foundation service is a minimal runnable control-plane slice that wires identity + policy
enforcement, a tiny workflow runtime, and Run trace persistence using the existing schema contracts.

### Run locally

```bash
cd packages/foundation-service
npm install
npm run dev
```

### Execute a workflow

```bash
curl -X POST http://localhost:4040/foundation/workflows/execute \\
  -H "content-type: application/json" \\
  -H "x-actor: ada.lovelace" \\
  -H "x-role: operator" \\
  -d '{"workflow_id":"foundation-trace-demo","action":"workflow:execute","inputs":["seed:demo"]}'
```

### Read a Run

```bash
curl -X GET http://localhost:4040/foundation/runs/<run_id> \\
  -H "x-actor: ada.lovelace" \\
  -H "x-role: observer"
```
