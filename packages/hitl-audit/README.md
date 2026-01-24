# HITL & Audit Schemas

This package defines the canonical schemas for human-in-the-loop (HITL) requests and audit log
entries used by Mass Relay governance workflows.

## Contents

- TypeScript interfaces: `src/hitl.ts`
- HITL request JSON schema: `src/hitl-request.schema.json`
- Audit log JSON schema: `src/audit-log.schema.json`

## Usage

HITL and audit records should validate against their schemas before storage or transmission.
