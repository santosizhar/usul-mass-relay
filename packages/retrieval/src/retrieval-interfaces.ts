export type RetrievalVisibility = "public" | "restricted";

export interface RetrievalAccessContext {
  actor: string;
  roles: string[];
  scopes: string[];
  policy_refs: string[];
}

export interface RetrievalFilters {
  collection_ids?: string[];
  tags?: string[];
  content_types?: string[];
}

export interface RetrievalFreshnessRequest {
  as_of: string;
  max_age_hours?: number;
  min_updated_at?: string;
  require_current?: boolean;
}

export interface RetrievalVersionRequest {
  version_id?: string;
  version_tag?: string;
  latest_only?: boolean;
  allow_previous?: boolean;
}

export interface RetrievalQuery {
  query_id: string;
  query_text: string;
  access: RetrievalAccessContext;
  filters?: RetrievalFilters;
  freshness?: RetrievalFreshnessRequest;
  version?: RetrievalVersionRequest;
}

export interface RetrievalPermissions {
  visibility: RetrievalVisibility;
  allowed_roles: string[];
  required_scopes: string[];
  policy_refs: string[];
}

export interface RetrievalVersionMetadata {
  version_id: string;
  version_tag: string;
  created_at: string;
  updated_at: string;
  source_system: string;
  source_version: string;
}

export interface RetrievalFreshnessMetadata {
  valid_from?: string;
  valid_to?: string;
  last_reviewed_at?: string;
}

export interface RetrievalDocument {
  document_id: string;
  collection_id: string;
  title: string;
  uri: string;
  content_type: string;
  excerpt: string;
  tags: string[];
  checksum: string;
  permissions: RetrievalPermissions;
  version: RetrievalVersionMetadata;
  freshness: RetrievalFreshnessMetadata;
}

export interface RetrievalMatch {
  document: RetrievalDocument;
  score: number;
  snippet: string;
}

export interface RetrievalResult {
  query_id: string;
  run_id: string;
  generated_at: string;
  results: RetrievalMatch[];
  citation_package_id?: string;
}

export interface RetrievalDocumentCatalog {
  catalog_id: string;
  name: string;
  updated_at: string;
  documents: RetrievalDocument[];
}
