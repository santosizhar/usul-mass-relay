# Execution Sandbox Contract

This package defines the sandbox configuration contract used to constrain governed execution
lanes. Sandbox policies are authored in the control plane and enforced by execution runners.

## Contents

- `src/execution-sandbox.ts`: TypeScript interfaces for sandbox policies.
- `src/execution-sandbox.schema.json`: JSON schema for sandbox validation.

## Usage notes

- Sandbox policies are versioned and immutable once published.
- Policies explicitly define filesystem, network, and resource boundaries.
