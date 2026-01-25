# Internal Knowledge Assistant

## Purpose

Internal Knowledge Assistant is a project configuration that delivers citation-first, permission-aware
question answering over company data. It is designed as an entry-level Factory product with minimal
automation complexity, while still enforcing governance, observability, and evidence requirements by
default. The assistant should be safe, trustworthy, and fast to deliver, acting as the next project
candidate that proves the Foundation can ship a high-trust knowledge experience quickly.

## Scope & Differentiation

- **Citation-first answers** with evidence packaging and source freshness awareness.
- **Permission-aware retrieval** at query time and output time.
- **Minimal automation complexity**: early phases can be read-only and A0/A1 governance.
- **Traceable, testable runs** for every response, aligned with Factory observability standards.

## Foundation Alignment

This project is a configuration built on top of the shared Foundation capabilities and must not re-
implement them locally. The assistant is a consumer of Foundation modules, especially the knowledge
layer, identity/policy enforcement, connector framework, and observability/evaluation gates.

### Foundation Capabilities Required

1. **Identity, permissions, and policy enforcement** for user- and agent-scoped access rules.
2. **Connector and ingestion framework** for normalized, traceable intake of company data.
3. **Canonical data model** for Documents, Records, AI requests/responses, and Insights.
4. **Workflow orchestration & agent runtime** for structured runs and human review hooks.
5. **LLM gateway** with prompt packs, routing, and validation/redaction.
6. **Unified observability** with run-level tracing, cost, and quality signals.
7. **Evaluation gates** with golden datasets and regression checks.
8. **Knowledge layer** with permission-aware retrieval and citations.
9. **Tooling interface & sandbox** for any governed actions beyond retrieval.
10. **UI/UX system & design language** for evidence panels, run timelines, and review queues.

## Governance & Execution Lanes

The assistant must follow the governance ladder and execution lanes:

- Default policies should be **A0 (read-only)** or **A1 (draft-only)** during early iterations.
- All orchestration and policy logic lives in the **control plane** (TypeScript + Node).
- Any non-read actions must be routed through **governed execution** (Python tools) with schema-
  governed contracts.
- The Control Room remains read-only and consumes artifacts without mutating Foundation state.

## Runs, Artifacts, and Evaluation

Every interaction emits a Run record with deterministic inputs/outputs, trace metadata, and status.
Artifacts should follow the repository conventions and be stored under `artifacts/` using the standard
run layout. Evaluation gates are expected to validate baseline behavior using golden datasets and
produce deterministic reports before release.

## Connector Lifecycle Requirements

Any ingestion connectors used by the assistant must honor the canonical lifecycle:

- incremental sync → change detection → normalization → lineage → ingestion result
- idempotent runs with monotonic state updates
- canonical FactoryObject shapes with lineage and run_id traceability

## Terminology (Project Usage)

- **Prompt Pack**: reserved for MP1/MP2/MP3 artifacts only.
- **Agent Playbook**: versioned runtime unit that governs the assistant’s behavior.
- **Governance policy**: A0–A3 ladder defining action boundaries and review gates.
- **Run**: atomic unit of observability, cost, and traceability for every query.

## Initial Success Criteria

- Accurate, citation-first answers with permission and freshness enforcement.
- Runs are traceable end-to-end with evaluation gate coverage.
- Operators can audit inputs, outputs, and evidence in shared UI patterns.
- Foundation modules are reused without project-specific exceptions.

## Project Positioning

Internal Knowledge Assistant is prioritized as the next project because it delivers high trust, fast
time-to-value, and a clear path to proving the knowledge layer, governance, and observability stack
without requiring heavy automation workflows. It sets the baseline for future projects that depend
on stronger agent orchestration and write-back capabilities.
