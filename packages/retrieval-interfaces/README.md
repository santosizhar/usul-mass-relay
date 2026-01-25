# Retrieval Interfaces

This package defines the canonical retrieval query, document, and response shapes for Mass Relay.
It captures permission-aware access context as well as version and freshness metadata for retrieved
content.

## Contents

- `src/retrieval-interfaces.ts`: TypeScript interfaces for retrieval queries and results.
- `src/retrieval-interfaces.schema.json`: JSON schema for retrieval document catalogs.

## Usage notes

- Queries must include an access context to enforce permission-aware retrieval.
- Document metadata includes both versioning and freshness fields for traceable results.
