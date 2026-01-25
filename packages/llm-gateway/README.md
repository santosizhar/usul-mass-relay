# LLM Gateway

This package defines the core LLM Gateway module for Mass Relay. It owns prompt registry
records (including versioning and diff metadata), routing policy hooks, and a model adapter
interface with a stub implementation. It also provides validation and redaction hooks that
emit Run log events for observability.

## Contents

- `src/gateway.ts`: Gateway types, hooks, adapters, and the `Gateway` orchestrator.

## Required configuration

The gateway needs the following configuration in order to run:

- `promptRegistry`: A registry implementation that can return prompt records and versions.
- `modelAdapters`: A map of model adapter instances keyed by adapter ID.
- `routingPolicies` (optional): Hooks that decide which adapter/model to target.
- `validationHooks` (optional): Hooks that accept/reject requests and log decisions.
- `redactionHooks` (optional): Hooks that redact sensitive inputs and log redactions.
- `runLogger` (optional): A logger that accepts `RunEvent` payloads from the gateway.
- `clock` (optional): A function that returns RFC 3339 timestamps for run events.

## Extension points

- **Prompt registry**: Provide a custom registry that pulls prompt content from your
  storage of choice while supplying version and diff metadata.
- **Routing policies**: Add hooks to apply business rules (cost, latency, compliance)
  before selecting a model adapter.
- **Model adapters**: Implement the `ModelAdapter` interface to integrate with
  vendor SDKs or internal model infrastructure.
- **Validation hooks**: Enforce input policy checks or schema validation, and leverage
  Run logs for auditing.
- **Redaction hooks**: Remove or mask sensitive input fields before hitting adapters,
  with redaction metadata surfaced in Run logs.

## Usage notes

- The default routing decision uses `adapter_hint`/`model_hint` from the request and
  falls back to a `StubModelAdapter` when nothing else is configured.
- Validation hooks throw when they fail; callers should catch errors upstream and
  mark Run status accordingly.
