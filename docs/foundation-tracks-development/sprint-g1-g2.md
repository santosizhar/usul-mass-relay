# Track G — Sprint G1–G2 Summary

This document captures the Track G sprint work for schema tests (G1) and golden runs (G2).
It outlines the regression assets, validations, and known gaps.

## Sprint G1 — Schema tests

### Delivered artifacts

- Schema test suite runner (`scripts/check_schema_suite.js`).
- Existing schema validation checks chained by the suite:
  - Run artifacts (`scripts/check_run_artifacts.js`).
  - Agent playbook (`scripts/check_agent_playbook.js`).
  - Governance policy (`scripts/check_governance_policy.js`).
  - HITL and audit (`scripts/check_hitl_audit.js`).
  - Governance registry (`scripts/check_governance_registry.js`).
  - Tool manifest (`scripts/check_tool_manifest.js`).
  - Python runner (`scripts/check_python_runner.js`).
  - Execution sandbox (`scripts/check_execution_sandbox.js`).
  - Reference tools (`scripts/check_reference_tools.js`).
  - Storage interfaces (`scripts/check_storage_interface.js`).
  - Run storage (`scripts/check_run_storage.js`).
  - Playbook persistence (`scripts/check_playbook_persistence.js`).
  - Project config persistence (`scripts/check_project_config_persistence.js`).

### Validation notes

- The suite runs each schema check in a deterministic order and fails fast on any contract drift.
- Schema checks continue to validate samples against their JSON schemas without runtime wiring.

## Sprint G2 — Golden runs

### Delivered artifacts

- Golden run export snapshot (`artifacts/exports/runs.golden.jsonl`).
- Golden run regression check (`scripts/check_golden_runs.js`).

### Validation notes

- The golden run export is generated from the immutable run artifacts in `artifacts/runs/`.
- The regression check compares exported runs to the golden snapshot and the documentation sample export.

## Known gaps

- Golden runs cover deterministic export ordering but not end-to-end runtime execution.
- Schema checks are file-based and do not yet integrate with CI or runtime services.

## Next steps

- Add CI wiring to run the schema suite and golden run checks on each change.
- Expand golden run coverage to include multi-run exports and instrumentation timelines.
