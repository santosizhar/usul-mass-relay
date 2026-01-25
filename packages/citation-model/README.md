# Citation Model

This package defines the citation packaging format used to trace knowledge responses back to their
source material.

## Contents

- `src/citation-package.ts`: TypeScript interfaces for citation packages.
- `src/citation-package.schema.json`: JSON schema for citation packages.

## Usage notes

- Citation packages are stored as artifacts and referenced from Run outputs.
- Each package ties a retrieval query and run to the cited sources.
