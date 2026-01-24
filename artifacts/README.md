# Artifacts

The `artifacts/` directory stores versioned outputs produced by Runs.

## Structure

- `runs/`: Run-specific artifacts, immutable after creation.
- `examples/`: Sample artifacts used for documentation and validation.
- `exports/`: Deterministic snapshots of Runs for downstream analysis.

## Usage notes

Artifacts should be written via governed execution or control plane logic. Each artifact should
include metadata that ties it back to a Run. Export files should be deterministic and reference
the Run IDs included in the snapshot.
