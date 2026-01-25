# Governance Contracts

Unified governance contracts for playbooks, policy ladders, registry records, and HITL audit data.

## Contents

- Playbooks: `src/agent-playbook.ts`, `src/agent-playbook.schema.json`
- Governance policies: `src/governance-policy.ts`, `src/governance-policy.schema.json`, `src/enforcement.ts`
- Registry records: `src/registry.ts`, `src/registry.schema.json`
- HITL + audit: `src/hitl.ts`, `src/hitl-request.schema.json`, `src/audit-log.schema.json`
- Validators: `src/validation.ts` (playbook + policy validation helpers)

## Usage notes

- Validate playbook and policy records with `validateAgentPlaybook` / `validateGovernancePolicy` before storage.
- Policy enforcement helpers remain in `src/enforcement.ts` for control-plane usage.
