# Retrieval

Unified retrieval contracts, catalog runtime, stub runtime, and citation packaging.

## Contents

- Interfaces: `src/retrieval-interfaces.ts`, `src/retrieval-interfaces.schema.json`
- Runtime: `src/catalog-runtime.ts` (file-backed catalog queries)
- Stub runtime: `src/retrieval-stub.ts` (sample catalog filtering)
- Citations: `src/citation-package.ts`, `src/citation-package.schema.json`

## Usage notes

- Catalogs must match the retrieval interfaces schema before querying.
- The stub runtime is deterministic and intended for demos + tests.
