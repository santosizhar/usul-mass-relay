# Foundation Roadmap

This document defines the normalized, shared capabilities that are implemented once and reused across all projects.

---

## 1. Identity, Permissions, and Policy Enforcement

- Workspace- and role-based access control.
- Permissions enforced at retrieval, action, and output time.
- Policies define allowed data sources, tools, and actions.
- AI agents are subject to the same permission rules as users.
- All access and policy decisions are audit-logged.

---

## 2. Connector and Ingestion Framework

- Standard interface for all external systems.
- Incremental sync and change detection.
- Canonical normalization of ingested data.
- Source lineage and freshness tracking.
- No project-specific ingestion logic allowed.

---

## 3. Canonical Data Model (Factory Objects)

- Core objects:
  - Document
  - Record
  - Task
  - WorkflowRun
  - AIRequest / AIResponse
  - Insight
  - EvaluationResult
- Stable schemas shared across projects.
- Metadata-based extensibility.
- Enables cross-project analytics and UI reuse.
- Required for observability and evaluation.

---

## 4. Workflow Orchestration and Agent Runtime

- Event, schedule, and manual triggers.
- Step execution, retries, and exception queues.
- Native human review and approval states.
- Standardized **Factory Agent** structure:
  - role
  - goals
  - prompt pack
  - allowed tools/actions
  - memory scope
  - input/output schema
- Projects customize agents via configuration only.

---

## 5. LLM Gateway

- Single entry point for all model calls.
- Prompt registry with versioning and diffs.
- Routing, fallback, and cost policies.
- Caching and rate limiting.
- Output validation and redaction hooks.

---

## 6. Unified Observability

- Per-run tracing across workflows, tools, and agents.
- Cost and latency tracking.
- Standard failure taxonomy.
- Anomaly and threshold alerting.
- Feeds reporting and reliability layers.

---

## 7. Evaluation and Release Gates

- Golden datasets and scenario templates.
- Standardized quality metrics.
- Automated regression testing.
- Red-team test library.
- Required gates for AI-affecting changes.

---

## 8. Knowledge Layer

- Permission-aware retrieval.
- Standard chunking and indexing strategy.
- Hybrid search support.
- Citation and evidence packaging.
- Version and freshness awareness.

---

## 9. Tooling Interface and Sandbox

- Standard tool definitions with schemas.
- Scoped secrets management.
- Sandboxed execution for risky actions.
- Full traceability of tool usage.
- No direct external actions by agents.

---

## 10. UI/UX System and Design Language

- Reusable operational UI patterns:
  - run timeline
  - review and exception queues
  - diff viewer
  - evidence panel
- Shared admin surfaces.
- Defined layout, spacing, and interaction rules.
- Standardized palette and theme tokens.
- Consistent UX across all projects.
