# Track D — Sprints D3 & D4

This document summarizes the Track D deliverables implemented in sprints D3 and D4.

## Sprint D3 — Sandboxing & safety

Artifacts:
- Execution sandbox TypeScript interfaces in `packages/execution-contracts/src/execution-sandbox.ts`.
- Execution sandbox JSON schema in `packages/execution-contracts/src/execution-sandbox.schema.json`.
- Execution sandbox sample in `artifacts/examples/execution.sandbox.sample.json`.

Checks:
- `scripts/check_execution_sandbox.js` validates the sandbox sample.

## Sprint D4 — Reference tools

Artifacts:
- Reference tool catalog TypeScript interfaces in `packages/execution-contracts/src/reference-tools.ts`.
- Reference tool catalog JSON schema in `packages/execution-contracts/src/reference-tools.schema.json`.
- Reference tool stubs in `packages/execution-contracts/src/tools/`.
- Reference tool catalog sample in `artifacts/examples/reference.tools.sample.json`.

Checks:
- `scripts/check_reference_tools.js` validates the reference tool catalog sample.

## Known limitations

- Sandbox policies are reference contracts without enforcement wiring.
- Reference tool stubs are deterministic examples without runtime integration.
