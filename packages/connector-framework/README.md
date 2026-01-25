# Connector Framework

This package defines the runtime contract for ingestion connectors, including incremental sync, change detection, normalization into canonical factory objects, and lineage capture.

## Key Concepts

- **Connector**: Implements the connector lifecycle functions.
- **ConnectorContext**: Carries run metadata, source information, and sync state.
- **IngestionResult**: Returns canonical objects, change events, lineage, and next state.

## Example

See [`examples/sample-crm-connector.ts`](examples/sample-crm-connector.ts) for a minimal stub that wires in the default helpers for change detection, normalization, and lineage.

## Runtime persistence

Use `src/connector-runtime.ts` to persist ingestion results, lineage snapshots, and connector state
into the `artifacts/ingestion` directory.
