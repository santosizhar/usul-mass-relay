# Governance

Mass Relay governance defines the guardrails for how Foundation modules, Projects, and execution
lanes interact.

## Architecture boundaries

- Foundation modules live in `packages/` and must not import from Projects.
- Projects live in `projects/` and may depend on Foundation modules.
- UI-only applications live in `apps/` and should consume Foundation outputs.

## Execution lanes

- **Control plane**: TypeScript + Node. All orchestration, policy, and governance logic belongs here.
- **Governed execution lane**: Python tools are allowed only behind schema-governed actions and must
  emit Runs.

## Operational rules

- Control Room is read-only and must never write to Foundation state.
- Every operation emits a Run with traceability metadata.
- Observability, cost, and quality signals are mandatory for all automation paths.

## Governance policy ladder (A0–A3)

Governance policies define action boundaries for Agent Playbooks and control-plane workflows.
The canonical schema lives in `packages/governance-policy/src/governance-policy.schema.json`
with a sample record in `artifacts/examples/governance.policy.sample.json`.

Levels:

- **A0**: Read-only insight with no external side effects.
- **A1**: Draft recommendations; no execution without human review.
- **A2**: Proposed changes; requires approval before execution.
- **A3**: Governed execution; approved actions with strict logging and audit trails.

## Limitations

This governance model now includes the Track C policy ladder definition but does not yet include
runtime enforcement or approval workflows.
