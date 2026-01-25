# Track C — Sprints C1 & C2

This document summarizes the Track C deliverables implemented in sprints C1 and C2.

## Sprint C1 — Playbook schema

Artifacts:
- Agent Playbook TypeScript interface in `packages/governance-contracts/src/agent-playbook.ts`.
- Agent Playbook JSON schema in `packages/governance-contracts/src/agent-playbook.schema.json`.
- Sample playbook record in `artifacts/examples/agent-playbook.sample.json`.

Checks:
- `scripts/check_agent_playbook.js` validates the sample playbook against the schema.

## Sprint C2 — Governance policy (A0–A3)

Artifacts:
- Governance policy TypeScript interface in `packages/governance-contracts/src/governance-policy.ts`.
- Governance policy JSON schema in `packages/governance-contracts/src/governance-policy.schema.json`.
- Governance policy sample in `artifacts/examples/governance.policy.sample.json`.
- Governance policy ladder documentation in `docs/governance.md`.

Checks:
- `scripts/check_governance_policy.js` validates the policy sample and level coverage.

## Known limitations

- Governance policies are defined but not yet enforced in runtime control-plane flows.
- Playbook samples are static references without registry or execution wiring.
