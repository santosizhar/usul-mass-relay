# Execution Contracts

Unified contracts for governed execution lanes, tool manifests, and reference tool catalogs.

## Contents

- Sandbox policies: `src/execution-sandbox.ts`, `src/execution-sandbox.schema.json`
- Tool manifests: `src/tool-manifest.ts`, `src/tool-manifest.schema.json`
- Python runner contracts: `src/python-runner.ts`, `src/python-runner.*.schema.json`, `src/runner.py`
- Reference tools: `src/reference-tools.ts`, `src/reference-tools.schema.json`, `src/tools/`
- Validators: `src/validation.ts` (sandbox + tool manifest validation helpers)

## Usage notes

- Use `validateExecutionSandbox` and `validateToolManifest` before publishing or executing governed tools.
- Python runner stubs are deterministic and side-effect free; replace with real runtime wiring in production.
