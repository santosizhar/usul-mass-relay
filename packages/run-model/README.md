# Run Model

This package defines the canonical Run record shape for Mass Relay. It provides a TypeScript
interface and a JSON schema for validation in control plane tooling.

## Contents

- `src/run.ts`: TypeScript interfaces for Run records.
- `src/run.schema.json`: JSON schema for Run records (Draft 2020-12).

## Usage notes

- The Run record is the atomic unit of observability, cost, quality, and traceability.
- Any persisted Run should validate against the schema and be immutable once written.
