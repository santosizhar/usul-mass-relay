# Run Model

This package defines the canonical Run record and Factory Object shapes for Mass Relay. It
provides TypeScript interfaces and JSON schemas for validation in control plane tooling.

## Contents

- `src/run.ts`: TypeScript interfaces for Run records and Factory Objects.
- `src/run.schema.json`: JSON schema for Run records (Draft 2020-12).
- `src/factory.schema.json`: JSON schema for Factory Objects (Draft 2020-12).

## Usage notes

- The Run record is the atomic unit of observability, cost, quality, and traceability.
- Any persisted Run should validate against the schema and be immutable once written.
- Factory Objects are the canonical representation of ingested source data and must align with
  connector normalization outputs.
