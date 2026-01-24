export type ExecutionLane = "python";

export interface ReferenceTool {
  tool_id: string;
  name: string;
  description: string;
  version: string;
  execution_lane: ExecutionLane;
  entrypoint: string;
  request_example: Record<string, unknown>;
  response_example: Record<string, unknown>;
}

export interface ReferenceToolCatalog {
  catalog_id: string;
  name: string;
  version: string;
  owner: string;
  created_at: string;
  updated_at: string;
  tools: ReferenceTool[];
}
