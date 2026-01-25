# LLM Gateway

This package defines the core LLM Gateway module for Mass Relay. It owns prompt registry
records (including versioning and diff metadata), routing policy hooks, and a model adapter
interface with a stub implementation. It also provides validation and redaction hooks that
emit Run log events for observability.

## Contents

- `src/gateway.ts`: Gateway types, hooks, adapters, and the `Gateway` orchestrator.
- `src/adapters.ts`: Reference model adapters for common providers (OpenAI, Grok, Deepseek, Gemini, Ollama).
- `src/file-registry.ts`: File-backed prompt registry loader for `artifacts/prompts`.

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

## Provider adapter setup

The gateway ships with reference adapters in `src/adapters.ts`. These are lightweight
helpers to call vendor APIs; use them as a starting point and extend with the parameters
you need (streaming, tool calls, JSON mode, etc.).

### OpenAI

- **Adapter**: `OpenAIAdapter`
- **API key**: Create a key in the OpenAI platform dashboard, then set `OPENAI_API_KEY`.
- **Optional headers**: `OPENAI_ORG_ID` and `OPENAI_PROJECT_ID`.
- **Models (examples)**: `gpt-4.1`, `gpt-4.1-mini`, `gpt-4o`, `gpt-4o-mini`.
- **Common parameters to tune later**: `temperature`, `max_tokens`, `top_p`, `stop`.

### Grok (xAI)

- **Adapter**: `GrokAdapter`
- **API key**: Create a key in the xAI console, then set `GROK_API_KEY`.
- **Models (examples)**: `grok-2-latest`, `grok-2-vision-latest`, `grok-1.5-latest`.
- **Common parameters to tune later**: `temperature`, `max_tokens`, `top_p`, `stop`.

### Deepseek

- **Adapter**: `DeepseekAdapter`
- **API key**: Create a key in the Deepseek platform, then set `DEEPSEEK_API_KEY`.
- **Models (examples)**: `deepseek-chat`, `deepseek-reasoner`.
- **Common parameters to tune later**: `temperature`, `max_tokens`, `top_p`, `stop`.

### Gemini (Google Generative Language API)

- **Adapter**: `GeminiAdapter`
- **API key**: Create a key in Google AI Studio, then set `GEMINI_API_KEY`.
- **Models (examples)**: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`.
- **Common parameters to tune later**: `temperature`, `maxOutputTokens`, `topP`, `topK`, `stopSequences`.

### Ollama (local)

- **Adapter**: `OllamaAdapter`
- **API key**: Not required for local Ollama; point the adapter at your Ollama host
  (default `http://localhost:11434`).
- **Models (examples)**: `llama3.1`, `qwen2.5`, `mistral`, `phi3`.
- **Common parameters to tune later**: `temperature`, `num_predict`, `top_p`, `stop`.

> **Note on models:** Model catalogs evolve frequently. Treat the examples above as
> common starting points; check each provider’s model list when wiring production calls.
