export interface CitationSource {
  source_id: string;
  uri: string;
  title: string;
  excerpt: string;
  content_type: string;
  checksum: string;
  version: string;
  retrieved_at: string;
}

export interface CitationPackage {
  package_id: string;
  run_id: string;
  query_id: string;
  created_at: string;
  sources: CitationSource[];
}
