import type {
  ChangeEvent,
  Connector,
  ConnectorContext,
  IncrementalSyncResult,
  LineageEvent,
  NormalizedRecord,
} from "../src/connector-framework";
import {
  defaultChangeDetection,
  defaultLineage,
  defaultNormalize,
} from "../src/connector-framework";

export const SampleCrmConnector: Connector = {
  name: "sample-crm",
  version: "0.1.0",
  async incrementalSync(context: ConnectorContext): Promise<IncrementalSyncResult> {
    const newState = {
      ...context.state,
      last_sync_at: new Date().toISOString(),
      cursor: context.state.cursor ?? "initial",
      checkpoint: context.state.checkpoint ?? {},
    };

    return {
      records: [],
      new_state: newState,
    };
  },
  async detectChanges(
    records: IncrementalSyncResult["records"],
    context: ConnectorContext
  ): Promise<ChangeEvent[]> {
    return defaultChangeDetection(records, context.state.checkpoint ?? {});
  },
  async normalize(
    changes: ChangeEvent[],
    context: ConnectorContext
  ): Promise<NormalizedRecord[]> {
    return defaultNormalize(changes, context.source.system);
  },
  async buildLineage(
    records: NormalizedRecord[],
    context: ConnectorContext
  ): Promise<LineageEvent[]> {
    return defaultLineage(records, context.run.run_id);
  },
};
