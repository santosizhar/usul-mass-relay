import fs from "node:fs";
import path from "node:path";

import {
  RetrievalDocumentCatalog,
  RetrievalMatch,
  RetrievalQuery,
  RetrievalResult
} from "./retrieval-interfaces";

export interface CatalogRuntimeOptions {
  catalogPath?: string;
  runId?: string;
}

const DEFAULT_CATALOG_PATH = path.resolve(process.cwd(), "artifacts", "knowledge", "catalog.json");

const isRoleAllowed = (documentRoles: string[], actorRoles: string[]): boolean => {
  return documentRoles.length === 0 || documentRoles.some((role) => actorRoles.includes(role));
};

const matchesFilters = (
  query: RetrievalQuery,
  document: RetrievalDocumentCatalog["documents"][number]
): boolean => {
  const filters = query.filters;
  if (!filters) {
    return true;
  }

  if (filters.collection_ids && !filters.collection_ids.includes(document.collection_id)) {
    return false;
  }
  if (filters.content_types && !filters.content_types.includes(document.content_type)) {
    return false;
  }
  if (filters.tags && filters.tags.length > 0) {
    const hasTag = filters.tags.some((tag) => document.tags.includes(tag));
    if (!hasTag) {
      return false;
    }
  }

  return true;
};

const matchesAccess = (
  query: RetrievalQuery,
  document: RetrievalDocumentCatalog["documents"][number]
): boolean => {
  const permissions = document.permissions;
  if (permissions.visibility === "restricted") {
    if (!isRoleAllowed(permissions.allowed_roles, query.access.roles)) {
      return false;
    }
  }
  if (permissions.required_scopes.length > 0) {
    const hasScope = permissions.required_scopes.every((scope) => query.access.scopes.includes(scope));
    if (!hasScope) {
      return false;
    }
  }
  if (permissions.policy_refs.length > 0) {
    const hasPolicy = permissions.policy_refs.some((policy) => query.access.policy_refs.includes(policy));
    if (!hasPolicy) {
      return false;
    }
  }
  return true;
};

const calculateScore = (queryText: string, document: RetrievalDocumentCatalog["documents"][number]): number => {
  const haystack = `${document.title} ${document.excerpt} ${document.tags.join(" ")}`.toLowerCase();
  const needle = queryText.toLowerCase();
  if (!needle) {
    return 0;
  }
  if (haystack.includes(needle)) {
    return 0.95;
  }
  const tokens = needle.split(/\s+/).filter(Boolean);
  const hits = tokens.filter((token) => haystack.includes(token)).length;
  return hits / Math.max(tokens.length, 1);
};

export const loadCatalog = (catalogPath = DEFAULT_CATALOG_PATH): RetrievalDocumentCatalog | null => {
  if (!fs.existsSync(catalogPath)) {
    return null;
  }
  const raw = fs.readFileSync(catalogPath, "utf8");
  return JSON.parse(raw) as RetrievalDocumentCatalog;
};

export const queryCatalog = (query: RetrievalQuery, options: CatalogRuntimeOptions = {}): RetrievalResult => {
  const catalogPath = options.catalogPath ?? DEFAULT_CATALOG_PATH;
  const catalog = loadCatalog(catalogPath);

  const runId = options.runId ?? `run-${Date.now()}`;
  if (!catalog) {
    return {
      query_id: query.query_id,
      run_id: runId,
      generated_at: new Date().toISOString(),
      results: []
    };
  }

  const matches: RetrievalMatch[] = catalog.documents
    .filter((doc) => matchesFilters(query, doc))
    .filter((doc) => matchesAccess(query, doc))
    .map((doc) => ({
      document: doc,
      score: calculateScore(query.query_text, doc),
      snippet: doc.excerpt
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    query_id: query.query_id,
    run_id: runId,
    generated_at: new Date().toISOString(),
    results: matches
  };
};
