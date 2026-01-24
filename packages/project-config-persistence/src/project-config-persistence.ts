export type ProjectConfigStorageFormat = "json";

export interface ProjectConfigStorageLocation {
  provider_id: string;
  namespace_id: string;
  object_path: string;
  checksum: string;
  size_bytes: number;
  content_type: string;
}

export interface ProjectConfigPersistenceRecord {
  project_id: string;
  stored_at: string;
  format: ProjectConfigStorageFormat;
  version: string;
  storage: ProjectConfigStorageLocation;
}
