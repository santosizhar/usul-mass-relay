# Tool Runtime Executor

This package provides a lightweight runtime executor for governed tools described by the tool
manifest contract. It validates tool manifests, enforces sandbox policies for unsafe tools, and
captures every tool invocation as Run events.

## Capabilities

- Validates tool manifests and sandbox policies against their JSON schemas.
- Validates tool request/response payloads against each tool contract.
- Requires sandbox policies for unsafe tools (non-A0 or HITL/policy references).
- Emits Run events for every invocation, including schema failures.

## Sample governed tool

The sample tool manifest includes a governed audit writer that requires a sandbox policy:

- Tool: `tool.write-audit-log`
- Governance level: `A3`
- Policy reference: `01J9Z1B3C4D5E6F7G8H9J0K1L2` (see `artifacts/examples/execution.sandbox.sample.json`)

## Usage flow

1. Load and validate the tool manifest.
2. Load and validate sandbox policies.
3. Register tool handlers.
4. Execute a governed tool invocation and capture Run events.

```ts
import { ToolRuntimeExecutor } from "./src/tool-runtime";
import toolManifest from "../artifacts/examples/tool.manifest.sample.json";
import sandboxPolicy from "../artifacts/examples/execution.sandbox.sample.json";

const executor = new ToolRuntimeExecutor({
  manifest: toolManifest,
  sandboxPolicies: [sandboxPolicy],
  toolHandlers: {
    "tool.write-audit-log": async (input) => {
      return {
        status: "success",
        output: {
          record_id: "audit-01JABCDXYZ",
          stored_at: new Date().toISOString()
        }
      };
    }
  }
});

const result = await executor.execute({
  request_id: "req-01JABCDXYZ",
  run_id: "run-01JABCDXYZ",
  tool_id: "tool.write-audit-log",
  requested_at: new Date().toISOString(),
  caller: "control-plane@mass-relay",
  input: {
    run_id: "run-01JABCDXYZ",
    event: "compliance.audit",
    severity: "high"
  },
  trace: {
    trace_id: "trace-01JABCDXYZ",
    span_id: "span-01JABCDXYZ"
  }
});

console.log(result.run_events);
```
