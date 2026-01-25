export type RegistryItemType = "playbook" | "policy";

export interface RegistryVersion {
  version: string;
  status: "draft" | "active" | "deprecated";
  released_at: string;
  checksum: string;
  run_id: string;
  artifact_refs: string[];
}

export interface RegistryRecord {
  registry_id: string;
  item_type: RegistryItemType;
  item_id: string;
  owner: string;
  created_at: string;
  updated_at: string;
  versions: RegistryVersion[];
}
