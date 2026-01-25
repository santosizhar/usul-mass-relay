import fs from "fs";
import path from "path";

import {
  RetrievalDocument,
  RetrievalDocumentCatalog,
  RetrievalMatch,
  RetrievalQuery,
  RetrievalResult
} from "../../retrieval-interfaces/src/retrieval-interfaces";

export interface RetrievalStubOptions {
  dataPath?: string;
  runId?: string;
  now?: Date;
  citationPackageId?: string;
}

const DEFAULT_SAMPLE_PATH = path.resolve(
  process.cwd(),
  "artifacts",
  "examples",
  "retrieval.documents.sample.json"
);

const includesAny = (values: string[], candidates: string[]): boolean => {
  return values.some((value) => candidates.includes(value));
};

const includesAll = (values: string[], candidates: string[]): boolean => {
  return values.every((value) => candidates.includes(value));
};

const isPermitted = (document: RetrievalDocument, query: RetrievalQuery): boolean => {
  const { permissions } = document;
  const { access } = query;

  if (permissions.visibility === "public") {
    return true;
  }

  if (permissions.allowed_roles.length > 0 && !includesAny(permissions.allowed_roles, access.roles)) {
    return false;
  }

  if (permissions.required_scopes.length > 0 && !includesAll(permissions.required_scopes, access.scopes)) {
    return false;
  }

  if (permissions.policy_refs.length > 0 && !includesAll(permissions.policy_refs, access.policy_refs)) {
    return false;
  }

  return true;
};

const matchesFilters = (document: RetrievalDocument, query: RetrievalQuery): boolean => {
  const filters = query.filters;
  if (!filters) {
    return true;
  }

  if (filters.collection_ids && filters.collection_ids.length > 0) {
    if (!filters.collection_ids.includes(document.collection_id)) {
      return false;
    }
  }

  if (filters.content_types && filters.content_types.length > 0) {
    if (!filters.content_types.includes(document.content_type)) {
      return false;
    }
  }

  if (filters.tags && filters.tags.length > 0) {
    if (!includesAny(document.tags, filters.tags)) {
      return false;
    }
  }

  return true;
};

const matchesFreshness = (
  document: RetrievalDocument,
  query: RetrievalQuery,
  now: Date
): boolean => {
  const freshness = query.freshness;
  if (!freshness) {
    return true;
  }

  const asOf = freshness.as_of ? new Date(freshness.as_of) : now;
  const updatedAt = new Date(document.version.updated_at);

  if (freshness.min_updated_at) {
    const minUpdated = new Date(freshness.min_updated_at);
    if (updatedAt < minUpdated) {
      return false;
    }
  }

  if (freshness.max_age_hours !== undefined) {
    const maxAgeMs = freshness.max_age_hours * 60 * 60 * 1000;
    if (asOf.getTime() - updatedAt.getTime() > maxAgeMs) {
      return false;
    }
  }

  if (freshness.require_current && document.freshness.valid_to) {
    const validTo = new Date(document.freshness.valid_to);
    if (asOf > validTo) {
      return false;
    }
  }

  return true;
};

const matchesVersion = (document: RetrievalDocument, query: RetrievalQuery): boolean => {
  const version = query.version;
  if (!version) {
    return true;
  }

  if (version.version_id && document.version.version_id !== version.version_id) {
    return Boolean(version.allow_previous);
  }

  if (version.version_tag && document.version.version_tag !== version.version_tag) {
    return Boolean(version.allow_previous);
  }

  return true;
};

export const loadRetrievalCatalog = (dataPath = DEFAULT_SAMPLE_PATH): RetrievalDocumentCatalog => {
  const contents = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(contents) as RetrievalDocumentCatalog;
};

export const retrieveFromSample = (
  query: RetrievalQuery,
  options: RetrievalStubOptions = {}
): RetrievalResult => {
  const catalog = loadRetrievalCatalog(options.dataPath);
  const now = options.now ?? new Date();

  const matches = catalog.documents
    .filter((document) => isPermitted(document, query))
    .filter((document) => matchesFilters(document, query))
    .filter((document) => matchesFreshness(document, query, now))
    .filter((document) => matchesVersion(document, query));

  const results: RetrievalMatch[] = matches.map((document) => ({
    document,
    score: 1,
    snippet: document.excerpt
  }));

  return {
    query_id: query.query_id,
    run_id: options.runId ?? "",
    generated_at: now.toISOString(),
    results,
    citation_package_id: options.citationPackageId
  };
};
