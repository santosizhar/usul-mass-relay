# Reference Tools

This package captures reference tool definitions and stubs for the governed execution lane. These
examples are intended to validate schemas and execution wiring without enabling uncontrolled I/O.

## Contents

- `src/reference-tools.ts`: TypeScript interfaces for reference tool catalogs.
- `src/reference-tools.schema.json`: JSON schema for catalog validation.
- `src/tools/`: Reference Python tool stubs.

## Usage notes

- Reference tools map to the Tool Manifest contract and Python runner inputs.
- Stubs are deterministic and side-effect free.
