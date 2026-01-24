export type PlaybookStorageFormat = "json";

export interface PlaybookStorageLocation {
  provider_id: string;
  namespace_id: string;
  object_path: string;
  checksum: string;
  size_bytes: number;
  content_type: string;
}

export interface PlaybookPersistenceRecord {
  playbook_id: string;
  stored_at: string;
  format: PlaybookStorageFormat;
  version: string;
  storage: PlaybookStorageLocation;
}
