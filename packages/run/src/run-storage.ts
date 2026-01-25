export type RunStorageFormat = "json";

export interface RunStorageLocation {
  provider_id: string;
  namespace_id: string;
  object_path: string;
  checksum: string;
  size_bytes: number;
  content_type: string;
}

export interface RunPersistenceRecord {
  run_id: string;
  stored_at: string;
  format: RunStorageFormat;
  version: string;
  storage: RunStorageLocation;
}
