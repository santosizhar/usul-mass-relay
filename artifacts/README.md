# Artifacts

The `artifacts/` directory stores versioned outputs produced by Runs.

## Structure

- `runs/`: Run-specific artifacts, immutable after creation.
- `examples/`: Sample artifacts used for documentation and validation.

## Usage notes

Artifacts should be written via governed execution or control plane logic. Each artifact should
include metadata that ties it back to a Run.
