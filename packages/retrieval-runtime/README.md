# Retrieval Runtime

This package provides a file-backed retrieval runtime that loads a document catalog and executes
permission-aware queries with basic ranking and citation-ready metadata.

## Contents

- `src/catalog-runtime.ts`: Catalog loader and query execution helpers.

## Usage notes

- The runtime expects catalogs to follow `packages/retrieval-interfaces`.
- Default catalog path: `artifacts/knowledge/catalog.json`.
