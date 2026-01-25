# Track G — Sprint G3–G4 Summary

This document captures the Track G sprint work for TS↔Python contract tests (G3) and boundary
enforcement (G4). It outlines the regression assets, validations, and known gaps.

## Sprint G3 — TS↔Python contract tests

### Delivered artifacts

- TS↔Python contract check (`scripts/check_ts_python_contracts.js`).
- Inputs covered by the contract check:
  - Tool manifest sample (`artifacts/examples/tool.manifest.sample.json`).
  - Python runner request sample (`artifacts/examples/python.runner.request.sample.json`).
  - Python runner response sample (`artifacts/examples/python.runner.response.sample.json`).

### Validation notes

- Confirms the Python runner request maps to the tool manifest contract (tool ID, version,
  governance, timeout, and request schema).
- Confirms the Python runner response output matches the manifest response schema and IDs.

## Sprint G4 — Boundary enforcement

### Delivered artifacts

- Boundary enforcement check (`scripts/check_boundary_enforcement.js`).

### Validation notes

- Scans Foundation packages and apps for forbidden `projects/` references to enforce the
  Foundation ↔ Projects separation.

## Known gaps

- Contract checks operate on samples and do not yet validate runtime payloads.
- Boundary checks focus on static file references and do not enforce runtime dependency graphs.

## Next steps

- Add CI wiring to run the contract and boundary checks on each change.
- Expand contract coverage to additional tool manifests and runner payloads.
