import { RunEvent } from "../../run/src/run-events";

export type PromptVersionStatus = "draft" | "active" | "deprecated";

export interface PromptDiffMetadata {
  base_version: string;
  author: string;
  created_at: string;
  summary: string;
  change_set?: string[];
}

export interface PromptVersion {
  version: string;
  status: PromptVersionStatus;
  released_at: string;
  checksum: string;
  content: string;
  diff?: PromptDiffMetadata;
  metadata?: Record<string, string>;
}

export interface PromptRegistryRecord {
  prompt_id: string;
  name: string;
  description: string;
  owner: string;
  created_at: string;
  updated_at: string;
  versions: PromptVersion[];
}

export interface PromptRegistry {
  getPrompt(promptId: string): PromptRegistryRecord | undefined;
  getPromptVersion(promptId: string, version: string): PromptVersion | undefined;
  listPromptVersions(promptId: string): PromptVersion[];
}

export interface GatewayPromptInput {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  metadata?: Record<string, string>;
}

export interface GatewayRequest {
  run_id: string;
  prompt_id: string;
  prompt_version: string;
  inputs: GatewayPromptInput[];
  metadata?: Record<string, string>;
  adapter_hint?: string;
  model_hint?: string;
}

export interface RoutingPolicyContext {
  run_id: string;
  prompt: PromptRegistryRecord;
  version: PromptVersion;
  request: GatewayRequest;
}

export interface RoutingPolicyDecision {
  adapter_id: string;
  model: string;
  metadata?: Record<string, string>;
}

export type RoutingPolicyHook = (
  context: RoutingPolicyContext,
) => RoutingPolicyDecision | undefined;

export interface ValidationHookResult {
  ok: boolean;
  violations?: string[];
  metadata?: Record<string, string>;
}

export interface ValidationHook {
  id: string;
  validate: (request: GatewayRequest, version: PromptVersion) => ValidationHookResult;
}

export interface RedactionRecord {
  field: string;
  reason: string;
  before: string;
  after: string;
}

export interface RedactionHookResult {
  redacted_inputs: GatewayPromptInput[];
  redactions: RedactionRecord[];
  metadata?: Record<string, string>;
}

export interface RedactionHook {
  id: string;
  redact: (request: GatewayRequest, version: PromptVersion) => RedactionHookResult;
}

export interface ModelInvocationRequest {
  run_id: string;
  prompt: PromptVersion;
  inputs: GatewayPromptInput[];
  model: string;
  metadata?: Record<string, string>;
}

export interface ModelInvocationResult {
  output_text: string;
  model: string;
  usage?: Record<string, number>;
  metadata?: Record<string, string>;
}

export interface ModelAdapter {
  id: string;
  invoke: (request: ModelInvocationRequest) => Promise<ModelInvocationResult>;
}

export interface GatewayRunLogger {
  record: (event: RunEvent) => void;
}

export interface GatewayConfig {
  promptRegistry: PromptRegistry;
  modelAdapters: Record<string, ModelAdapter>;
  routingPolicies?: RoutingPolicyHook[];
  validationHooks?: ValidationHook[];
  redactionHooks?: RedactionHook[];
  runLogger?: GatewayRunLogger;
  clock?: () => string;
}

export interface GatewayResponse {
  run_id: string;
  prompt_id: string;
  prompt_version: string;
  model: string;
  output_text: string;
  metadata?: Record<string, string>;
}

const createEventId = (() => {
  let counter = 0;
  return (runId: string): string => {
    counter += 1;
    return `${runId}-${Date.now()}-${counter}`;
  };
})();

const defaultClock = (): string => new Date().toISOString();

const buildRunEvent = (
  runId: string,
  message: string,
  metadata: Record<string, string> | undefined,
  clock: () => string,
): RunEvent => {
  return {
    event_id: createEventId(runId),
    run_id: runId,
    timestamp: clock(),
    type: "step",
    message,
    metadata,
  };
};

const recordRunEvent = (
  logger: GatewayRunLogger | undefined,
  event: RunEvent,
): void => {
  if (!logger) {
    return;
  }

  logger.record(event);
};

export const applyValidationHooks = (
  request: GatewayRequest,
  version: PromptVersion,
  hooks: ValidationHook[] = [],
  logger?: GatewayRunLogger,
  clock: () => string = defaultClock,
): void => {
  for (const hook of hooks) {
    const result = hook.validate(request, version);
    const status = result.ok ? "passed" : "failed";
    recordRunEvent(
      logger,
      buildRunEvent(
        request.run_id,
        `Validation hook ${hook.id} ${status}`,
        {
          hook_id: hook.id,
          status,
          violations: result.violations?.join("; ") ?? "",
          ...(result.metadata ?? {}),
        },
        clock,
      ),
    );

    if (!result.ok) {
      const details = result.violations?.join("; ") ?? "Validation failed.";
      throw new Error(`Validation hook ${hook.id} failed: ${details}`);
    }
  }
};

export const applyRedactionHooks = (
  request: GatewayRequest,
  version: PromptVersion,
  hooks: RedactionHook[] = [],
  logger?: GatewayRunLogger,
  clock: () => string = defaultClock,
): GatewayPromptInput[] => {
  let inputs = request.inputs;

  for (const hook of hooks) {
    const result = hook.redact({ ...request, inputs }, version);
    inputs = result.redacted_inputs;

    recordRunEvent(
      logger,
      buildRunEvent(
        request.run_id,
        `Redaction hook ${hook.id} applied`,
        {
          hook_id: hook.id,
          redaction_count: result.redactions.length.toString(),
          ...(result.metadata ?? {}),
        },
        clock,
      ),
    );
  }

  return inputs;
};

export class StubModelAdapter implements ModelAdapter {
  id: string;

  constructor(id = "stub") {
    this.id = id;
  }

  async invoke(request: ModelInvocationRequest): Promise<ModelInvocationResult> {
    return {
      output_text: `Stubbed response for ${request.model}`,
      model: request.model,
      metadata: {
        adapter_id: this.id,
      },
    };
  }
}

export class Gateway {
  private readonly promptRegistry: PromptRegistry;
  private readonly modelAdapters: Record<string, ModelAdapter>;
  private readonly routingPolicies: RoutingPolicyHook[];
  private readonly validationHooks: ValidationHook[];
  private readonly redactionHooks: RedactionHook[];
  private readonly runLogger?: GatewayRunLogger;
  private readonly clock: () => string;

  constructor(config: GatewayConfig) {
    this.promptRegistry = config.promptRegistry;
    this.modelAdapters = config.modelAdapters;
    this.routingPolicies = config.routingPolicies ?? [];
    this.validationHooks = config.validationHooks ?? [];
    this.redactionHooks = config.redactionHooks ?? [];
    this.runLogger = config.runLogger;
    this.clock = config.clock ?? defaultClock;
  }

  async execute(request: GatewayRequest): Promise<GatewayResponse> {
    const prompt = this.promptRegistry.getPrompt(request.prompt_id);
    if (!prompt) {
      throw new Error(`Prompt ${request.prompt_id} not found in registry.`);
    }

    const version = this.promptRegistry.getPromptVersion(
      request.prompt_id,
      request.prompt_version,
    );
    if (!version) {
      throw new Error(
        `Prompt version ${request.prompt_version} not found for ${request.prompt_id}.`,
      );
    }

    applyValidationHooks(
      request,
      version,
      this.validationHooks,
      this.runLogger,
      this.clock,
    );

    const redactedInputs = applyRedactionHooks(
      request,
      version,
      this.redactionHooks,
      this.runLogger,
      this.clock,
    );

    const routingDecision = this.resolveRoutingDecision({
      run_id: request.run_id,
      prompt,
      version,
      request,
    });

    const adapter = this.modelAdapters[routingDecision.adapter_id];
    if (!adapter) {
      throw new Error(`Model adapter ${routingDecision.adapter_id} not configured.`);
    }

    recordRunEvent(
      this.runLogger,
      buildRunEvent(
        request.run_id,
        `Routing decision: ${routingDecision.adapter_id}:${routingDecision.model}`,
        {
          adapter_id: routingDecision.adapter_id,
          model: routingDecision.model,
          ...(routingDecision.metadata ?? {}),
        },
        this.clock,
      ),
    );

    const response = await adapter.invoke({
      run_id: request.run_id,
      prompt: version,
      inputs: redactedInputs,
      model: routingDecision.model,
      metadata: request.metadata,
    });

    return {
      run_id: request.run_id,
      prompt_id: request.prompt_id,
      prompt_version: request.prompt_version,
      model: response.model,
      output_text: response.output_text,
      metadata: response.metadata,
    };
  }

  private resolveRoutingDecision(context: RoutingPolicyContext): RoutingPolicyDecision {
    for (const hook of this.routingPolicies) {
      const decision = hook(context);
      if (decision) {
        return decision;
      }
    }

    const adapterId = context.request.adapter_hint ?? "stub";
    const model = context.request.model_hint ?? "stub-model";
    return {
      adapter_id: adapterId,
      model,
      metadata: {
        policy: "default",
      },
    };
  }
}
