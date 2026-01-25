import fs from "node:fs";
import path from "node:path";

import type { ConnectorState, IngestionResult } from "./connector-framework";

export interface ConnectorRuntimePersistOptions {
  baseDir?: string;
  persistState?: boolean;
}

export interface ConnectorPersistedArtifacts {
  ingestion_file: string;
  lineage_file: string;
  state_file?: string;
}

const resolveBaseDir = (baseDir?: string): string => {
  return baseDir ?? path.resolve(process.cwd(), "artifacts", "ingestion");
};

export const persistIngestionResult = (
  result: IngestionResult,
  options: ConnectorRuntimePersistOptions = {}
): ConnectorPersistedArtifacts => {
  const baseDir = resolveBaseDir(options.baseDir);
  const ingestionDir = path.join(baseDir, "runs");
  const lineageDir = path.join(baseDir, "lineage");
  const stateDir = path.join(baseDir, "state");

  fs.mkdirSync(ingestionDir, { recursive: true });
  fs.mkdirSync(lineageDir, { recursive: true });

  const ingestionFile = path.join(ingestionDir, `${result.run.run_id}.json`);
  const lineageFile = path.join(lineageDir, `${result.run.run_id}.json`);

  fs.writeFileSync(
    ingestionFile,
    `${JSON.stringify({ objects: result.objects, changes: result.changes }, null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    lineageFile,
    `${JSON.stringify({ lineage: result.lineage }, null, 2)}\n`,
    "utf8"
  );

  let stateFile: string | undefined;
  if (options.persistState ?? true) {
    fs.mkdirSync(stateDir, { recursive: true });
    const statePayload: ConnectorState = result.next_state;
    stateFile = path.join(stateDir, `${result.run.run_id}.json`);
    fs.writeFileSync(stateFile, `${JSON.stringify(statePayload, null, 2)}\n`, "utf8");
  }

  return {
    ingestion_file: ingestionFile,
    lineage_file: lineageFile,
    state_file: stateFile
  };
};
