# Agent Playbook Schema

This package defines the canonical Agent Playbook model for Mass Relay. Playbooks describe
runtime behavior in a deterministic, versionable format.

## Contents

- TypeScript interface: `src/agent-playbook.ts`
- JSON schema: `src/agent-playbook.schema.json`

## Usage

Playbook records should validate against the JSON schema before being stored or executed. The
schema is intended for control-plane governance and playbook registry workflows.
