# Factory

Canonical factory object schemas, fixtures, validation, and persistence helpers.

## Contents

- Types + validation: `src/types.ts`, `src/validation.ts`
- Persistence: `src/factory-store.ts`, `src/factory-pipeline.ts`
- Schemas: `schemas/`
- Fixtures: `fixtures/`

## Usage notes

- Use `validateFactoryObject` before persistence to enforce schema alignment.
- Persistence helpers write to `artifacts/factory-objects/<object_type>/`.
