# Governance Policy Schema

This package defines the canonical governance policy ladder for Mass Relay, including the A0–A3
levels used to gate execution capabilities.

## Contents

- TypeScript interface: `src/governance-policy.ts`
- JSON schema: `src/governance-policy.schema.json`
- Enforcement helpers: `src/enforcement.ts`

## Usage

Governance policy records should validate against the JSON schema before use in control-plane
policy enforcement or playbook registration.
