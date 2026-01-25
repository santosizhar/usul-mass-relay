# Connector Lifecycle & Invariants

This document defines the expected lifecycle for ingestion connectors and the invariants each phase must uphold.

## Lifecycle Stages

1. **Incremental Sync**
   - Pull the smallest slice of source data needed since the last checkpoint.
   - Return `IncrementalSyncResult.records` and the `new_state` snapshot for the next run.

2. **Change Detection**
   - Classify each source record as `created`, `updated`, `deleted`, or `unchanged`.
   - Emit a `ChangeEvent` for every record (including unchanged records when needed for lineage completeness).

3. **Normalization**
   - Convert each `ChangeEvent` into a canonical `FactoryObject`.
   - Preserve source identifiers in `object_id` (e.g., `${source_system}:${record_id}`) to ensure stable mappings.

4. **Lineage**
   - Capture upstream/downstream references to other factory objects for traceability.
   - Attach the current run identifier to every lineage event.

5. **Ingestion Result**
   - Emit the canonical objects, lineage, and next connector state as a single `IngestionResult` payload.
   - Persist `next_state` only after downstream consumers have successfully accepted the payload.

## Invariants

- **Idempotency**: Re-running a connector with the same `ConnectorContext.state` should produce the same change classification.
- **Monotonic state updates**: `ConnectorState` should advance forward; never discard newer checkpoints.
- **Canonical shape**: Every normalized record must conform to the `FactoryObject` schema in `packages/run`.
- **Lineage completeness**: If an object depends on other objects, the lineage event must include those upstream identifiers.
- **Traceability**: `run_id` must be preserved throughout the connector lifecycle and embedded into lineage.
