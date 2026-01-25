# Track C — Sprints C3 & C4

This document summarizes the Track C deliverables implemented in sprints C3 and C4.

## Sprint C3 — HITL hooks & audit logging

Artifacts:
- HITL request and audit log TypeScript interfaces in `packages/governance-contracts/src/hitl.ts`.
- HITL request schema in `packages/governance-contracts/src/hitl-request.schema.json`.
- Audit log schema in `packages/governance-contracts/src/audit-log.schema.json`.
- HITL request sample in `artifacts/examples/hitl.request.sample.json`.
- Audit log sample in `artifacts/examples/audit.log.sample.json`.

Checks:
- `scripts/check_hitl_audit.js` validates HITL and audit samples.

## Sprint C4 — Registry & versioning

Artifacts:
- Governance registry TypeScript interfaces in `packages/governance-contracts/src/registry.ts`.
- Governance registry schema in `packages/governance-contracts/src/registry.schema.json`.
- Governance registry sample in `artifacts/examples/governance.registry.sample.json`.

Checks:
- `scripts/check_governance_registry.js` validates registry samples and version uniqueness.

## Known limitations

- HITL and audit artifacts are schema-only references without runtime wiring.
- Registry records are static samples without persistence or approval workflows.
