export type StorageProviderType = "object-store" | "kv-store" | "filesystem";

export type StorageStatus = "active" | "deprecated";

export type StorageEncryption = "none" | "at-rest" | "in-transit";

export interface StorageCapabilities {
  supports_versioning: boolean;
  supports_encryption: boolean;
  max_object_bytes: number;
  max_retention_days: number;
}

export interface StorageProvider {
  provider_id: string;
  name: string;
  type: StorageProviderType;
  owner: string;
  region: string;
  base_uri: string;
  status: StorageStatus;
  created_at: string;
  updated_at: string;
  capabilities: StorageCapabilities;
}

export interface StorageNamespace {
  namespace_id: string;
  provider_id: string;
  name: string;
  purpose: string;
  default_prefix: string;
  retention_days: number;
  encryption: StorageEncryption;
  created_at: string;
  updated_at: string;
}

export interface StorageObject {
  object_id: string;
  namespace_id: string;
  path: string;
  checksum: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
  run_id: string;
  tags: string[];
}

export interface StorageCatalog {
  provider: StorageProvider;
  namespaces: StorageNamespace[];
  objects: StorageObject[];
}
