# Factory Persistence

Read/write persistence helpers for Factory Objects.

## Usage

- `persistFactoryObject` validates and writes an object to `artifacts/factory-objects/<object_type>/<id>.json`.
- `loadFactoryObject` reads and validates an object by type + ID.
- `listFactoryObjectIds` lists stored object IDs for a given type.
- `persistFactoryObjects` (in `src/factory-pipeline.ts`) persists a batch and reports failures.

Validation is provided by `packages/factory-objects`.
