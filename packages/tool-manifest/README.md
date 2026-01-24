# Tool Manifest Contract

This package defines the canonical manifest and contract shape for governed execution tools. The
manifest is intended to be authored in the control plane and consumed by governed execution lanes.

## Contents

- `src/tool-manifest.ts`: TypeScript interfaces for tool manifests.
- `src/tool-manifest.schema.json`: JSON schema for tool manifest validation.

## Usage notes

- Manifests are versioned and immutable once published.
- Tool contracts must include request and response JSON schemas.
- Execution lanes are explicit; Track D focuses on the Python lane.
