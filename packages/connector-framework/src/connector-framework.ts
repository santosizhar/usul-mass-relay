import type { FactoryObject, FactoryObjectLineage, RunRecord } from "../../run-model/src/run";

export type ChangeType = "created" | "updated" | "deleted" | "unchanged";

export interface ConnectorState {
  cursor?: string;
  last_sync_at?: string;
  checkpoint?: Record<string, string>;
}

export interface ConnectorContext {
  run: RunRecord;
  state: ConnectorState;
  source: {
    system: string;
    connection_uri: string;
  };
}

export interface SourceRecord {
  record_id: string;
  observed_at: string;
  payload: Record<string, unknown>;
  checksum?: string;
  source_uri?: string;
}

export interface IncrementalSyncResult {
  records: SourceRecord[];
  new_state: ConnectorState;
}

export interface ChangeEvent {
  record: SourceRecord;
  change_type: ChangeType;
  reason?: string;
}

export interface NormalizedRecord {
  object: FactoryObject;
  source: SourceRecord;
  change_type: ChangeType;
}

export interface LineageEvent extends FactoryObjectLineage {
  object_id: string;
}

export interface IngestionResult {
  run: RunRecord;
  objects: FactoryObject[];
  changes: ChangeEvent[];
  lineage: LineageEvent[];
  next_state: ConnectorState;
}

export interface Connector {
  name: string;
  version: string;
  incrementalSync(context: ConnectorContext): Promise<IncrementalSyncResult>;
  detectChanges(
    records: SourceRecord[],
    context: ConnectorContext
  ): Promise<ChangeEvent[]>;
  normalize(
    changes: ChangeEvent[],
    context: ConnectorContext
  ): Promise<NormalizedRecord[]>;
  buildLineage(
    records: NormalizedRecord[],
    context: ConnectorContext
  ): Promise<LineageEvent[]>;
}

export async function runConnectorCycle(
  connector: Connector,
  context: ConnectorContext
): Promise<IngestionResult> {
  const syncResult = await connector.incrementalSync(context);
  const changes = await connector.detectChanges(syncResult.records, context);
  const normalized = await connector.normalize(changes, context);
  const lineage = await connector.buildLineage(normalized, context);

  return {
    run: context.run,
    objects: normalized.map((entry) => entry.object),
    changes,
    lineage,
    next_state: syncResult.new_state,
  };
}

export function defaultChangeDetection(
  records: SourceRecord[],
  previousChecksums: Record<string, string>
): ChangeEvent[] {
  return records.map((record) => {
    const prior = previousChecksums[record.record_id];
    if (!prior) {
      return { record, change_type: "created", reason: "new-record" };
    }
    if (record.checksum && record.checksum !== prior) {
      return { record, change_type: "updated", reason: "checksum-changed" };
    }
    return { record, change_type: "unchanged", reason: "no-change" };
  });
}

export function defaultNormalize(
  changes: ChangeEvent[],
  sourceSystem: string
): NormalizedRecord[] {
  return changes.map((change) => {
    const payload = change.record.payload;
    const object: FactoryObject = {
      object_id: `${sourceSystem}:${change.record.record_id}`,
      kind: "entity",
      name: String(payload["name"] ?? change.record.record_id),
      description: payload["description"] ? String(payload["description"]) : undefined,
      source_system: sourceSystem,
      source_uri:
        change.record.source_uri ?? `${sourceSystem}:${change.record.record_id}`,
      created_at: change.record.observed_at,
      updated_at: change.record.observed_at,
      tags: [],
      attributes: payload,
    };

    return {
      object,
      source: change.record,
      change_type: change.change_type,
    };
  });
}

export function defaultLineage(
  normalized: NormalizedRecord[],
  run_id: string
): LineageEvent[] {
  return normalized.map((record) => ({
    object_id: record.object.object_id,
    upstream_object_ids: [],
    downstream_object_ids: [],
    run_id,
  }));
}
