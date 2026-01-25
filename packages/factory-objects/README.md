# Factory Objects

Canonical factory object schemas, fixtures, and validation utilities.

## Schemas

Versioned JSON schemas live in `schemas/`:

- `document.v1.schema.json`
- `record.v1.schema.json`
- `task.v1.schema.json`
- `workflow-run.v1.schema.json`
- `ai-request.v1.schema.json`
- `ai-response.v1.schema.json`
- `insight.v1.schema.json`
- `evaluation-result.v1.schema.json`

## Fixtures

Sample fixtures matching each schema are stored in `fixtures/`.

## Validation

Use `validateFactoryObject` (or the per-object validators) from `src/validation.ts` to deterministically validate payloads before persistence.
