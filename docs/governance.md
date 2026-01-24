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

## Limitations

This governance model is scoped to Track A sprints A1 and A2 and will expand in later tracks.
