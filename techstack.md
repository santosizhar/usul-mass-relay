# Techstack Core (Foundation 00_c Alignment)

This document maps the current repository to the Foundation techstack categories defined in
`docs/foundation-prework/00_c_foundation_techstack.md`.

## Repository mapping

| Foundation stack category | Current repo technology + purpose | Status notes |
| --- | --- | --- |
| **Frontend** | **Next.js + React + TypeScript** power the Control Room read-only UI surface (`apps/control-room-runs`). | Implemented as a UI-only surface; no backend wiring yet. |
| **Backend / Control Plane** | **TypeScript contracts + JSON schemas** define agent playbooks, governance, tools, and control-plane interfaces (`packages/*`). | Control-plane runtime is not implemented; only schemas/contracts exist. |
| **Data and Storage** | **Schema-first storage interfaces** for runs, artifacts, and project configs live in `packages/run-storage`, `packages/run-persistence`, and `packages/storage-interfaces`. | File-based reference artifacts exist; runtime storage systems are not wired. |
| **Knowledge and Retrieval** | **Not yet implemented** (no embedding, vector search, or retrieval packages). | This category is currently absent in code; needs foundation module(s). |
| **Async and Execution** | **Python runner + execution sandbox schemas** provide governed execution lane contracts (`packages/python-runner`, `packages/execution-sandbox`). | Only stubs/contracts; async infrastructure (queues, schedulers) not present. |
| **Observability and Evaluation** | **Run model + instrumentation helpers** provide event, trace, and run metadata contracts (`packages/run-model`, `packages/run-instrumentation`). | Observability is schema-driven; no live metrics/trace pipeline yet. |

## Differences / undeveloped features

- **Runtime services are not yet wired**; the repo is intentionally scaffolding and deterministic
  artifacts for future integrations. This impacts backend services, async execution, storage, and
  observability pipelines.
- **Knowledge & Retrieval** remains a gap area with no concrete foundation module yet.
