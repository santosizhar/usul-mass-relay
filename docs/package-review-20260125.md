# Package review (2026-01-25)

This document captures the post-consolidation package layout, current behavior, and the
schema-only contracts that were upgraded with production-ready validation helpers.

## Package inventory (current structure)

| Package | Stated functionality | Actual functionality (observed) | Status |
| --- | --- | --- | --- |
| config-persistence | Persistence record contracts for playbooks and project configs. | Storage location + checksum records for playbooks and project configs. | Schema-only contracts. |
| connector-framework | Runtime contract for ingestion connectors + persistence helpers. | Connector lifecycle types, default change detection/normalization/lineage helpers, and ingestion artifact persistence. | Functional helper library. |
| evaluation-runtime | Evaluation gate runtime for score gating. | Loads gate configs, applies scoring gates, persists results to artifacts. | Functional helper library. |
| execution-contracts | Unified contracts for governed execution (tool manifests, sandbox policies, runner, reference tools). | Tool manifest + sandbox contracts, Python runner schemas + stub, reference tool catalogs/stubs. | Contract bundle + stubs. |
| factory | Canonical factory object schemas, validation, and persistence helpers. | TypeScript types + validation + file-based persistence for factory objects. | Functional helper library. |
| foundation-service | Demo service wiring governance, gateway, retrieval, tools, and persistence. | HTTP server orchestrating key packages for a runnable demo flow. | Functional composition service / demo. |
| governance-contracts | Unified governance contracts (playbooks, policies, registry, HITL/audit). | TypeScript interfaces + schema files + enforcement helpers. | Contract bundle + enforcement utilities. |
| llm-gateway | LLM gateway with prompt registry, adapters, and hooks. | Gateway types, validation/redaction hooks, stub adapter, and prompt registry helpers. | Functional gateway core (stubbed adapters by default). |
| retrieval | Unified retrieval contracts + file-backed runtime + stub runtime + citations. | Retrieval interfaces, catalog query runtime, sample stub runtime, citation packaging. | Functional helper runtime + contracts. |
| run | Unified Run record contracts, instrumentation helpers, and persistence utilities. | Run types, event helpers, file-based persistence and storage contracts. | Functional helper library. |
| storage-interfaces | Storage provider/catalog interfaces. | TypeScript interfaces for providers, namespaces, and objects. | Schema-only contract. |
| tool-runtime | Tool executor with schema validation and sandbox enforcement. | Validates manifests/sandboxes, invokes tools, emits Run events. | Functional runtime. |
| workflow-runtime | Workflow runtime with retries, failure modes, and HITL queueing. | Executes workflows, persists run/HITL artifacts, manages failure modes. | Functional runtime. |

## Completed mergers

- **Governance contracts**: `agent-playbook`, `governance-policy`, `governance-registry`, `hitl-audit` → `governance-contracts`.
- **Execution contracts**: `execution-sandbox`, `tool-manifest`, `python-runner`, `reference-tools` → `execution-contracts`.
- **Retrieval stack**: `retrieval-interfaces`, `retrieval-runtime`, `retrieval-stub`, `citation-model` → `retrieval`.
- **Run/observability**: `run-model`, `run-instrumentation`, `run-persistence`, `run-storage` → `run`.
- **Factory**: `factory-objects`, `factory-persistence` → `factory`.
- **Config persistence**: `playbook-persistence`, `project-config-persistence` → `config-persistence`.

## Schema-only contracts upgraded to production-ready

The following contract-only items now ship with deterministic JSON schema validation helpers
and `assert*` utilities for use in control-plane ingestion and publishing flows:

1. **Agent Playbooks** (`packages/governance-contracts/src/validation.ts`)
2. **Governance Policies** (`packages/governance-contracts/src/validation.ts`)
3. **Execution Sandbox Policies** (`packages/execution-contracts/src/validation.ts`)
4. **Tool Manifests** (`packages/execution-contracts/src/validation.ts`)
