# Governance Registry Schema

This package defines registry records for governance artifacts (Agent Playbooks and governance
policies) and their version histories.

## Contents

- TypeScript interfaces: `src/registry.ts`
- JSON schema: `src/registry.schema.json`

## Usage

Registry records should validate against the JSON schema before publishing or loading into the
control-plane registry service.
