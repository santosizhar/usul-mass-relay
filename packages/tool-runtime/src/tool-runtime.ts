import { ExecutionSandbox } from "../../execution-sandbox/src/execution-sandbox";
import { RunEvent, RunEventType } from "../../run-instrumentation/src/run-events";
import { RunTrace } from "../../run-model/src/run";
import { ToolDefinition, ToolManifest } from "../../tool-manifest/src/tool-manifest";
import executionSandboxSchema from "../../execution-sandbox/src/execution-sandbox.schema.json";
import toolManifestSchema from "../../tool-manifest/src/tool-manifest.schema.json";
import { SchemaValidationResult, validateAgainstSchema } from "./schema-validation";

export type ToolExecutionStatus = "success" | "failure";

export interface ToolInvocationError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface ToolInvocationRequest {
  request_id: string;
  run_id: string;
  tool_id: string;
  requested_at: string;
  caller: string;
  input: Record<string, unknown>;
  trace: RunTrace;
}

export interface ToolInvocationResult {
  request_id: string;
  run_id: string;
  tool_id: string;
  tool_version: string;
  status: ToolExecutionStatus;
  started_at: string;
  finished_at: string;
  output: Record<string, unknown>;
  error?: ToolInvocationError;
  trace: RunTrace;
  sandbox?: ExecutionSandbox;
  run_events: RunEvent[];
}

export interface ToolExecutionContext {
  tool: ToolDefinition;
  manifest: ToolManifest;
  sandbox?: ExecutionSandbox;
  timeout_seconds?: number;
}

export interface ToolHandlerResult {
  status: ToolExecutionStatus;
  output: Record<string, unknown>;
  error?: ToolInvocationError;
}

export type ToolHandler = (
  input: Record<string, unknown>,
  context: ToolExecutionContext
) => ToolHandlerResult | Promise<ToolHandlerResult>;

export interface ToolRuntimeOptions {
  manifest: ToolManifest;
  sandboxPolicies?: ExecutionSandbox[];
  toolHandlers: Record<string, ToolHandler>;
  defaultSandboxId?: string;
  eventIdFactory?: () => string;
  clock?: () => string;
}

const buildEventId = (): string => {
  return `evt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

const buildTimestamp = (): string => new Date().toISOString();

export const validateToolManifest = (manifest: ToolManifest): SchemaValidationResult => {
  return validateAgainstSchema(toolManifestSchema, manifest, "tool.manifest");
};

export const validateExecutionSandbox = (sandbox: ExecutionSandbox): SchemaValidationResult => {
  return validateAgainstSchema(executionSandboxSchema, sandbox, "execution.sandbox");
};

const isUnsafeTool = (tool: ToolDefinition): boolean => {
  return (
    tool.governance.level !== "A0" ||
    tool.governance.requires_hitl ||
    (tool.policy_refs?.length ?? 0) > 0
  );
};

const buildInvocationEvent = (
  eventId: string,
  request: ToolInvocationRequest,
  tool: ToolDefinition,
  message: string,
  timestamp: string,
  type: RunEventType,
  status?: ToolExecutionStatus | "pending",
  sandboxId?: string
): RunEvent => {
  return {
    event_id: eventId,
    run_id: request.run_id,
    timestamp,
    type,
    message,
    metadata: {
      tool_id: tool.tool_id,
      tool_version: tool.version,
      request_id: request.request_id,
      caller: request.caller,
      status: status ?? "pending",
      sandbox_id: sandboxId ?? "none"
    }
  };
};

export class ToolRuntimeExecutor {
  private manifest: ToolManifest;
  private sandboxPolicies: ExecutionSandbox[];
  private toolHandlers: Record<string, ToolHandler>;
  private defaultSandboxId?: string;
  private eventIdFactory: () => string;
  private clock: () => string;

  constructor(options: ToolRuntimeOptions) {
    const manifestResult = validateToolManifest(options.manifest);
    if (!manifestResult.valid) {
      const details = manifestResult.issues.map((issue) => `${issue.path} ${issue.message}`).join("; ");
      throw new Error(`Tool manifest validation failed: ${details}`);
    }

    const sandboxPolicies = options.sandboxPolicies ?? [];
    sandboxPolicies.forEach((policy) => {
      const policyResult = validateExecutionSandbox(policy);
      if (!policyResult.valid) {
        const details = policyResult.issues.map((issue) => `${issue.path} ${issue.message}`).join("; ");
        throw new Error(`Execution sandbox validation failed: ${details}`);
      }
    });

    this.manifest = options.manifest;
    this.sandboxPolicies = sandboxPolicies;
    this.toolHandlers = options.toolHandlers;
    this.defaultSandboxId = options.defaultSandboxId;
    this.eventIdFactory = options.eventIdFactory ?? buildEventId;
    this.clock = options.clock ?? buildTimestamp;
  }

  private resolveTool(toolId: string): ToolDefinition {
    const tool = this.manifest.tools.find((entry) => entry.tool_id === toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found in manifest ${this.manifest.manifest_id}`);
    }
    return tool;
  }

  private resolveSandbox(tool: ToolDefinition): ExecutionSandbox | undefined {
    if (!isUnsafeTool(tool)) {
      return undefined;
    }

    if (tool.policy_refs && tool.policy_refs.length > 0) {
      const matched = this.sandboxPolicies.find((policy) =>
        tool.policy_refs?.includes(policy.sandbox_id)
      );
      if (matched) {
        return matched;
      }
    }

    if (this.defaultSandboxId) {
      const matched = this.sandboxPolicies.find(
        (policy) => policy.sandbox_id === this.defaultSandboxId
      );
      if (matched) {
        return matched;
      }
    }

    return this.sandboxPolicies.find(
      (policy) => policy.execution_lane === tool.execution_lane
    );
  }

  public async execute(request: ToolInvocationRequest): Promise<ToolInvocationResult> {
    const tool = this.resolveTool(request.tool_id);
    const handler = this.toolHandlers[request.tool_id];
    if (!handler) {
      throw new Error(`Missing tool handler for ${request.tool_id}`);
    }

    const sandbox = this.resolveSandbox(tool);
    if (isUnsafeTool(tool) && !sandbox) {
      throw new Error(`Sandbox policy required for unsafe tool ${tool.tool_id}`);
    }

    const startedAt = this.clock();
    const events: RunEvent[] = [
      buildInvocationEvent(
        this.eventIdFactory(),
        request,
        tool,
        "Tool invocation started",
        startedAt,
        "start",
        "pending",
        sandbox?.sandbox_id
      )
    ];

    const inputValidation = validateAgainstSchema(
      tool.contract.request_schema,
      request.input,
      `${tool.tool_id}.request`
    );

    if (!inputValidation.valid) {
      const finishedAt = this.clock();
      const error: ToolInvocationError = {
        code: "schema_validation_failed",
        message: "Tool request payload failed schema validation.",
        details: {
          issues: inputValidation.issues.map((issue) => `${issue.path} ${issue.message}`).join("; ")
        }
      };
      events.push(
        buildInvocationEvent(
          this.eventIdFactory(),
          request,
          tool,
          "Tool invocation failed request schema validation",
          finishedAt,
          "failure",
          "failure",
          sandbox?.sandbox_id
        )
      );
      return {
        request_id: request.request_id,
        run_id: request.run_id,
        tool_id: request.tool_id,
        tool_version: tool.version,
        status: "failure",
        started_at: startedAt,
        finished_at: finishedAt,
        output: {},
        error,
        trace: request.trace,
        sandbox,
        run_events: events
      };
    }

    let result: ToolHandlerResult;

    try {
      result = await handler(request.input, {
        tool,
        manifest: this.manifest,
        sandbox,
        timeout_seconds: tool.constraints?.timeout_seconds
      });
    } catch (error) {
      const finishedAt = this.clock();
      const invocationError: ToolInvocationError = {
        code: "handler_exception",
        message: error instanceof Error ? error.message : "Tool handler threw an exception."
      };
      events.push(
        buildInvocationEvent(
          this.eventIdFactory(),
          request,
          tool,
          "Tool invocation failed with handler exception",
          finishedAt,
          "failure",
          "failure",
          sandbox?.sandbox_id
        )
      );
      return {
        request_id: request.request_id,
        run_id: request.run_id,
        tool_id: request.tool_id,
        tool_version: tool.version,
        status: "failure",
        started_at: startedAt,
        finished_at: finishedAt,
        output: {},
        error: invocationError,
        trace: request.trace,
        sandbox,
        run_events: events
      };
    }

    const outputValidation = validateAgainstSchema(
      tool.contract.response_schema,
      result.output,
      `${tool.tool_id}.response`
    );

    if (!outputValidation.valid) {
      result = {
        status: "failure",
        output: {},
        error: {
          code: "schema_validation_failed",
          message: "Tool response payload failed schema validation.",
          details: {
            issues: outputValidation.issues
              .map((issue) => `${issue.path} ${issue.message}`)
              .join("; ")
          }
        }
      };
    }

    if (result.error && tool.contract.error_schema) {
      const errorValidation = validateAgainstSchema(
        tool.contract.error_schema,
        result.error,
        `${tool.tool_id}.error`
      );
      if (!errorValidation.valid) {
        result = {
          status: "failure",
          output: {},
          error: {
            code: "schema_validation_failed",
            message: "Tool error payload failed schema validation.",
            details: {
              issues: errorValidation.issues
                .map((issue) => `${issue.path} ${issue.message}`)
                .join("; ")
            }
          }
        };
      }
    }

    const finishedAt = this.clock();
    const completionType = result.status === "success" ? "finish" : "failure";
    events.push(
      buildInvocationEvent(
        this.eventIdFactory(),
        request,
        tool,
        "Tool invocation finished",
        finishedAt,
        completionType,
        result.status,
        sandbox?.sandbox_id
      )
    );

    return {
      request_id: request.request_id,
      run_id: request.run_id,
      tool_id: request.tool_id,
      tool_version: tool.version,
      status: result.status,
      started_at: startedAt,
      finished_at: finishedAt,
      output: result.output,
      error: result.error,
      trace: request.trace,
      sandbox,
      run_events: events
    };
  }
}
