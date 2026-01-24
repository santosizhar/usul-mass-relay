# Run Persistence & Exporter

This package provides reference control plane helpers for persisting Run records and exporting
Run history for analysis. It is a file-based implementation aligned with the `artifacts/` layout.

## Contents

- `src/run-store.ts`: Persistence helpers for writing and loading Run records.
- `src/run-exporter.ts`: Export utilities for producing JSONL snapshots of stored Runs.

## Usage notes

- Run records are immutable once written. `persistRun` throws if a Run already exists.
- Exported JSONL files are sorted by Run ID for deterministic output.
