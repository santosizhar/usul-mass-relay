export type ExecutionLane = "python";

export type GovernanceLevel = "A0" | "A1" | "A2" | "A3";

export interface ToolGovernance {
  level: GovernanceLevel;
  requires_hitl: boolean;
  requires_run_logging: boolean;
}

export interface ToolContract {
  request_schema: Record<string, unknown>;
  response_schema: Record<string, unknown>;
  error_schema?: Record<string, unknown>;
}

export interface ToolConstraints {
  timeout_seconds?: number;
  max_retries?: number;
}

export interface ToolDefinition {
  tool_id: string;
  name: string;
  description: string;
  version: string;
  execution_lane: ExecutionLane;
  contract: ToolContract;
  governance: ToolGovernance;
  constraints?: ToolConstraints;
  policy_refs?: string[];
}

export interface ToolManifest {
  manifest_id: string;
  name: string;
  version: string;
  owner: string;
  created_at: string;
  updated_at: string;
  tools: ToolDefinition[];
}
