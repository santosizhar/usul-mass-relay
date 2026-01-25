import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { GovernanceLevelPolicy, GovernancePolicy } from "../../governance-policy/src/governance-policy";
import { evaluatePolicy, writePolicyAudit } from "../../governance-policy/src/enforcement";
import { Gateway, GatewayRequest, GatewayResponse, PromptRegistry, PromptRegistryRecord, StubModelAdapter } from "../../llm-gateway/src/gateway";
import { createFilePromptRegistry } from "../../llm-gateway/src/file-registry";
import { RunEvent } from "../../run-instrumentation/src/run-events";
import { buildRunSummary } from "../../run-instrumentation/src/run-instrumentation";
import { RunRecord } from "../../run-model/src/run";
import { loadRun, persistRun, upsertRun } from "../../run-persistence/src/run-store";
import { Connector, ConnectorContext, defaultChangeDetection, defaultLineage, defaultNormalize, runConnectorCycle, SourceRecord } from "../../connector-framework/src/connector-framework";
import { persistIngestionResult } from "../../connector-framework/src/connector-runtime";
import { persistFactoryObject } from "../../factory-persistence/src/factory-store";
import { persistFactoryObjects } from "../../factory-persistence/src/factory-pipeline";
import { AIRequest, AIResponse, EvaluationResult, RecordObject } from "../../factory-objects/src/types";
import { CitationPackage } from "../../citation-model/src/citation-package";
import { ToolRuntimeExecutor } from "../../tool-runtime/src/tool-runtime";
import { ToolManifest } from "../../tool-manifest/src/tool-manifest";
import { ExecutionSandbox } from "../../execution-sandbox/src/execution-sandbox";
import { queryCatalog } from "../../retrieval-runtime/src/catalog-runtime";
import { applyEvaluationGates, loadGateConfig, persistGateResults } from "../../evaluation-runtime/src/gate-runtime";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const runsBaseDir = path.join(repoRoot, "artifacts", "runs");

interface ActorContext {
  actor: string;
  role: string;
}

interface WorkflowRequest {
  workflow_id: string;
  action: string;
  inputs: string[];
}

interface WorkflowDefinition {
  workflow_id: string;
  purpose: string;
  steps: string[];
}

interface ConnectorIngestRequest {
  source_system: string;
  connection_uri: string;
  records?: SourceRecord[];
  previous_checksums?: Record<string, string>;
}

interface GatewayExecuteRequest {
  run_id?: string;
  prompt_id: string;
  prompt_version: string;
  inputs: GatewayRequest["inputs"];
  metadata?: Record<string, string>;
}

interface RetrievalRequest {
  query_id: string;
  query: string;
  access: {
    actor?: string;
    roles: string[];
    scopes: string[];
    policy_refs: string[];
  };
  filters?: {
    collection_ids?: string[];
    content_types?: string[];
    tags?: string[];
  };
}

interface EvaluationRequest {
  target_ref: string;
  evaluator_id: string;
  score: number;
  score_range: {
    min: number;
    max: number;
  };
  rubric?: string;
  notes?: string;
  metrics?: Array<{ metric: string; value: number; unit?: string }>;
}

interface ToolExecuteRequest {
  run_id?: string;
  tool_id: string;
  caller: string;
  input: Record<string, unknown>;
}

const fallbackGovernancePolicy: GovernancePolicy = {
  policy_id: "foundation-policy",
  name: "Foundation baseline",
  version: "0.1.0",
  owner: "foundation",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  levels: [
    {
      level: "A0",
      name: "Observer",
      description: "Read-only access.",
      allowed_actions: ["run:read", "retrieval:query"],
      requires_human_review: false,
      requires_run_logging: true,
      restricted_data: ["restricted"]
    },
    {
      level: "A1",
      name: "Operator",
      description: "Workflow execution within policy.",
      allowed_actions: [
        "run:read",
        "workflow:execute",
        "connector:ingest",
        "gateway:execute",
        "retrieval:query",
        "evaluation:score",
        "tool:execute"
      ],
      requires_human_review: false,
      requires_run_logging: true,
      restricted_data: []
    }
  ],
  escalation_path: ["A0", "A1"]
};

const roleToLevel: Record<string, GovernanceLevelPolicy["level"]> = {
  observer: "A0",
  operator: "A1"
};

const governancePolicyPath = path.join(repoRoot, "artifacts", "governance", "policies", "foundation-policy.json");
const governancePolicy: GovernancePolicy = fs.existsSync(governancePolicyPath)
  ? (JSON.parse(fs.readFileSync(governancePolicyPath, "utf8")) as GovernancePolicy)
  : fallbackGovernancePolicy;

const workflows: WorkflowDefinition[] = [
  {
    workflow_id: "foundation-trace-demo",
    purpose: "Demonstrate a governed workflow execution trace.",
    steps: ["validate-identity", "apply-policy", "execute-workflow", "record-run"]
  }
];

const promptRegistryRecords: PromptRegistryRecord[] = [
  {
    prompt_id: "ops-remediation-plan",
    name: "Ops remediation planner",
    description: "Drafts remediation plans with governed guardrails.",
    owner: "foundation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    versions: [
      {
        version: "1.0.0",
        status: "active",
        released_at: new Date().toISOString(),
        checksum: "checksum-ops-remediation-plan-1.0.0",
        content: "You are a remediation planner. Draft a plan using the provided context."
      }
    ]
  }
];

const promptRegistry: PromptRegistry = (() => {
  const fileRegistry = createFilePromptRegistry({ baseDir: path.join(repoRoot, "artifacts", "prompts") });
  if (fileRegistry.getPrompt("ops-remediation-plan")) {
    return fileRegistry;
  }

  return {
    getPrompt: (promptId: string): PromptRegistryRecord | undefined => {
      return promptRegistryRecords.find((record) => record.prompt_id === promptId);
    },
    getPromptVersion: (promptId: string, version: string) => {
      const prompt = promptRegistryRecords.find((record) => record.prompt_id === promptId);
      return prompt?.versions.find((item) => item.version === version);
    },
    listPromptVersions: (promptId: string) => {
      const prompt = promptRegistryRecords.find((record) => record.prompt_id === promptId);
      return prompt?.versions ?? [];
    }
  };
})();

const buildGateway = (runLogger?: { record: (event: RunEvent) => void }) =>
  new Gateway({
    promptRegistry,
    modelAdapters: {
      echo: {
        id: "echo",
        invoke: async (request) => {
          const userText = request.inputs.map((item) => item.content).join("\n");
          return {
            output_text: `Echo plan for ${request.model}:\n${userText}`.trim(),
            model: request.model,
            metadata: {
              adapter_id: "echo"
            }
          };
        }
      },
      stub: new StubModelAdapter("stub")
    },
    routingPolicies: [
      () => ({
        adapter_id: "echo",
        model: "foundation-echo-001",
        metadata: {
          policy: "foundation-default"
        }
      })
    ],
    validationHooks: [
      {
        id: "non-empty-inputs",
        validate: (request) => ({
          ok: request.inputs.length > 0,
          violations: request.inputs.length > 0 ? [] : ["No prompt inputs provided."]
        })
      }
    ],
    redactionHooks: [
      {
        id: "strip-secrets",
        redact: (request) => ({
          redacted_inputs: request.inputs.map((input) => ({
            ...input,
            content: input.content.replace(/secret/gi, "[redacted]")
          })),
          redactions: []
        })
      }
    ],
    runLogger
  });

const loadToolManifest = (): ToolManifest => {
  const manifestPath = path.join(repoRoot, "artifacts", "examples", "tool.manifest.sample.json");
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ToolManifest;
  }
  return toolManifest;
};

const toolManifest: ToolManifest = {
  manifest_id: "foundation-tools",
  name: "Foundation reference tools",
  version: "0.1.0",
  owner: "foundation",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tools: [
    {
      tool_id: "ops.echo",
      name: "Ops Echo Tool",
      description: "Echoes input payloads for governed testing.",
      version: "0.1.0",
      execution_lane: "python",
      contract: {
        request_schema: { type: "object", properties: { message: { type: "string" } }, required: ["message"] },
        response_schema: { type: "object", properties: { echoed: { type: "string" } }, required: ["echoed"] }
      },
      governance: {
        level: "A1",
        requires_hitl: false,
        requires_run_logging: true
      },
      constraints: {
        timeout_seconds: 5
      },
      policy_refs: ["sandbox-default"]
    }
  ]
};

const loadSandboxPolicies = (): ExecutionSandbox[] => {
  const policyPath = path.join(repoRoot, "artifacts", "examples", "execution.sandbox.sample.json");
  if (fs.existsSync(policyPath)) {
    return [JSON.parse(fs.readFileSync(policyPath, "utf8")) as ExecutionSandbox];
  }
  return sandboxPolicies;
};

const sandboxPolicies: ExecutionSandbox[] = [
  {
    sandbox_id: "sandbox-default",
    name: "Default governed sandbox",
    version: "0.1.0",
    owner: "foundation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    execution_lane: "python",
    filesystem: {
      mode: "read-write",
      read_paths: ["artifacts"],
      write_paths: ["artifacts"]
    },
    network: {
      mode: "deny-all",
      allow_hosts: [],
      allow_ports: []
    },
    environment: {
      allowlist: []
    },
    resources: {
      cpu_cores: 1,
      memory_mb: 256,
      timeout_seconds: 5
    },
    logging: {
      redact_patterns: ["secret", "token"]
    }
  }
];

const buildToolRuntime = () =>
  new ToolRuntimeExecutor({
    manifest: loadToolManifest(),
    sandboxPolicies: loadSandboxPolicies(),
    toolHandlers: {
      "tool.fetch-object-storage": (input) => ({
        status: "success",
        output: {
          uri: `artifact://storage/${String(input["bucket"] ?? "bucket")}/${String(input["key"] ?? "object")}`,
          content_type: "application/json"
        }
      }),
      "ops.echo": (input) => ({
        status: "success",
        output: {
          echoed: String(input["message"] ?? "")
        }
      }),
      "tool.write-audit-log": (input) => ({
        status: "success",
        output: {
          record_id: `audit-${randomUUID()}`,
          stored_at: new Date().toISOString(),
          event: String(input["event"] ?? "unknown")
        }
      })
    },
    defaultSandboxId: "sandbox-default"
  });

const enforcePolicyAction = (
  actor: string,
  role: string,
  action: string,
  resource?: string
): { ok: boolean; error?: string } => {
  const level = roleToLevel[role];
  if (!level) {
    return { ok: false, error: `Unknown role ${role}` };
  }
  const decision = evaluatePolicy({
    policy: governancePolicy,
    level,
    actor,
    role,
    action,
    resource
  });
  writePolicyAudit(decision, {
    policy: governancePolicy,
    level,
    actor,
    role,
    action,
    resource
  });
  if (!decision.allowed) {
    return { ok: false, error: decision.violations.join("; ") };
  }
  return { ok: true };
};

const createRunRecord = (purpose: string, actor: ActorContext, inputs: string[]): RunRecord => {
  return {
    run_id: randomUUID(),
    timestamp: new Date().toISOString(),
    source: "control-plane",
    actor: actor.actor,
    purpose,
    inputs,
    outputs: [],
    status: "success",
    trace: {
      trace_id: randomUUID(),
      span_id: randomUUID()
    }
  };
};

const parseJsonBody = async (req: RequestLike): Promise<unknown> => {
  const body = await req.readBody();
  if (!body) {
    return null;
  }

  return JSON.parse(body);
};

const createWorkflowRunRecord = (workflow: WorkflowDefinition, request: WorkflowRequest, actor: ActorContext): RunRecord => {
  const timestamp = new Date().toISOString();
  return {
    run_id: randomUUID(),
    timestamp,
    source: "control-plane",
    actor: actor.actor,
    purpose: workflow.purpose,
    inputs: request.inputs,
    outputs: [
      `workflow:${workflow.workflow_id}`,
      `steps:${workflow.steps.length}`,
      "policy:enforced"
    ],
    status: "success",
    trace: {
      trace_id: randomUUID(),
      span_id: randomUUID()
    }
  };
};

const handleWorkflowExecute = async (req: RequestLike, res: ResponseLike) => {
  const actor = req.headers.get("x-actor") ?? "unknown";
  const role = req.headers.get("x-role") ?? "observer";
  const policyCheck = enforcePolicyAction(actor, role, "workflow:execute");
  if (!policyCheck.ok) {
    return res.json(403, { error: policyCheck.error });
  }

  const payload = (await parseJsonBody(req)) as WorkflowRequest | null;
  if (!payload) {
    return res.json(400, { error: "Missing workflow payload" });
  }

  const workflow = workflows.find((item) => item.workflow_id === payload.workflow_id);
  if (!workflow) {
    return res.json(404, { error: "Unknown workflow", workflow_id: payload.workflow_id });
  }

  const run = createWorkflowRunRecord(workflow, payload, { actor, role });
  const runDir = persistRun(run, { baseDir: runsBaseDir });
  const summary = buildRunSummary(run);

  return res.json(200, {
    run,
    summary,
    storage: {
      run_dir: runDir
    }
  });
};

const mapRecordObject = (record: SourceRecord, objectId: string, recordType: string): RecordObject => {
  const now = new Date().toISOString();
  return {
    object_type: "record",
    schema_version: "1.0.0",
    created_at: now,
    updated_at: now,
    record_id: objectId,
    record_type: recordType,
    source_record_id: record.record_id,
    attributes: record.payload,
    status: "active"
  };
};

const persistCitationPackage = (citation: CitationPackage): string => {
  const citationsDir = path.join(repoRoot, "artifacts", "citations");
  const filename = path.join(citationsDir, `${citation.package_id}.json`);
  fs.mkdirSync(citationsDir, { recursive: true });
  fs.writeFileSync(filename, `${JSON.stringify(citation, null, 2)}\n`, "utf8");
  return filename;
};

const handleConnectorIngest = async (req: RequestLike, res: ResponseLike) => {
  const actor = req.headers.get("x-actor") ?? "unknown";
  const role = req.headers.get("x-role") ?? "operator";
  const policyCheck = enforcePolicyAction(actor, role, "connector:ingest");
  if (!policyCheck.ok) {
    return res.json(403, { error: policyCheck.error });
  }

  const payload = (await parseJsonBody(req)) as ConnectorIngestRequest | null;
  if (!payload) {
    return res.json(400, { error: "Missing ingestion payload" });
  }

  const run = createRunRecord("Connector ingestion cycle", { actor, role }, [
    `source:${payload.source_system}`
  ]);

  const connector: Connector = {
    name: "sample-connector",
    version: "0.1.0",
    incrementalSync: async (context: ConnectorContext) => {
      const records = payload.records ?? [
        {
          record_id: "record-001",
          observed_at: new Date().toISOString(),
          payload: { name: "Sample record", description: "Sample connector payload" },
          checksum: "checksum-001"
        }
      ];
      return {
        records,
        new_state: {
          cursor: context.state.cursor ?? "cursor-001",
          last_sync_at: new Date().toISOString()
        }
      };
    },
    detectChanges: async (records, context) => {
      return defaultChangeDetection(records, payload.previous_checksums ?? context.state.checkpoint ?? {});
    },
    normalize: async (changes) => {
      return defaultNormalize(changes, payload.source_system);
    },
    buildLineage: async (records) => defaultLineage(records, run.run_id)
  };

  const ingest = await runConnectorCycle(connector, {
    run,
    state: {
      cursor: payload.previous_checksums ? "resume" : undefined,
      checkpoint: payload.previous_checksums
    },
    source: {
      system: payload.source_system,
      connection_uri: payload.connection_uri
    }
  });

  const persistedObjects = ingest.changes.map((change, index) => {
    const objectId = `${payload.source_system}-${change.record.record_id}-${index}`;
    const recordObject = mapRecordObject(change.record, objectId, payload.source_system);
    return recordObject;
  });

  const factoryPersist = persistFactoryObjects(persistedObjects);
  const ingestionArtifacts = persistIngestionResult(ingest, {
    baseDir: path.join(repoRoot, "artifacts", "ingestion")
  });

  run.outputs = [
    `objects:${ingest.objects.length}`,
    `changes:${ingest.changes.length}`,
    `lineage:${ingest.lineage.length}`
  ];
  upsertRun(run, { baseDir: runsBaseDir });

  return res.json(200, {
    run,
    ingestion: ingest,
    persisted_objects: factoryPersist,
    ingestion_artifacts: ingestionArtifacts
  });
};

const handleGatewayExecute = async (req: RequestLike, res: ResponseLike) => {
  const actor = req.headers.get("x-actor") ?? "unknown";
  const role = req.headers.get("x-role") ?? "operator";
  const policyCheck = enforcePolicyAction(actor, role, "gateway:execute");
  if (!policyCheck.ok) {
    return res.json(403, { error: policyCheck.error });
  }

  const payload = (await parseJsonBody(req)) as GatewayExecuteRequest | null;
  if (!payload) {
    return res.json(400, { error: "Missing gateway payload" });
  }

  const runId = payload.run_id ?? randomUUID();
  const events: RunEvent[] = [];
  const gateway = buildGateway({
    record: (event) => events.push(event)
  });

  const response: GatewayResponse = await gateway.execute({
    run_id: runId,
    prompt_id: payload.prompt_id,
    prompt_version: payload.prompt_version,
    inputs: payload.inputs,
    metadata: payload.metadata,
  });

  const aiRequest: AIRequest = {
    object_type: "ai_request",
    schema_version: "1.0.0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ai_request_id: `ai-req-${runId}`,
    requester_id: actor,
    model: response.model,
    prompt: payload.prompt_id,
    parameters: payload.metadata ?? {},
    requested_at: new Date().toISOString(),
    input_refs: payload.inputs.map((input) => input.content)
  };

  const aiResponse: AIResponse = {
    object_type: "ai_response",
    schema_version: "1.0.0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ai_response_id: `ai-res-${runId}`,
    ai_request_id: aiRequest.ai_request_id,
    model: response.model,
    responded_at: new Date().toISOString(),
    output_text: response.output_text
  };

  persistFactoryObject(aiRequest);
  persistFactoryObject(aiResponse);

  const run: RunRecord = {
    run_id: runId,
    timestamp: new Date().toISOString(),
    source: "control-plane",
    actor,
    purpose: "LLM gateway execution",
    inputs: payload.inputs.map((input) => input.content),
    outputs: [`ai_request:${aiRequest.ai_request_id}`, `ai_response:${aiResponse.ai_response_id}`],
    status: "success",
    trace: {
      trace_id: randomUUID(),
      span_id: randomUUID()
    }
  };

  upsertRun(run, { baseDir: runsBaseDir });

  return res.json(200, {
    response,
    events,
    persisted: {
      ai_request: aiRequest.ai_request_id,
      ai_response: aiResponse.ai_response_id
    }
  });
};

const handleRetrievalQuery = async (req: RequestLike, res: ResponseLike) => {
  const actor = req.headers.get("x-actor") ?? "unknown";
  const role = req.headers.get("x-role") ?? "observer";
  const policyCheck = enforcePolicyAction(actor, role, "retrieval:query");
  if (!policyCheck.ok) {
    return res.json(403, { error: policyCheck.error });
  }

  const payload = (await parseJsonBody(req)) as RetrievalRequest | null;
  if (!payload) {
    return res.json(400, { error: "Missing retrieval payload" });
  }

  const queryId = payload.query_id;
  const runId = randomUUID();
  const result = queryCatalog(
    {
      query_id: queryId,
      query_text: payload.query,
      access: {
        actor: payload.access.actor ?? actor,
        roles: payload.access.roles,
        scopes: payload.access.scopes,
        policy_refs: payload.access.policy_refs
      },
      filters: payload.filters
    },
    { runId }
  );

  const citation: CitationPackage = {
    package_id: randomUUID(),
    run_id: runId,
    query_id: queryId,
    created_at: new Date().toISOString(),
    sources: result.results.map((match) => ({
      source_id: match.document.document_id,
      uri: match.document.uri,
      title: match.document.title,
      excerpt: match.document.excerpt,
      content_type: match.document.content_type,
      checksum: match.document.checksum,
      version: match.document.version.version_id,
      retrieved_at: new Date().toISOString()
    }))
  };

  const citationFile = persistCitationPackage(citation);

  const run: RunRecord = {
    run_id: runId,
    timestamp: new Date().toISOString(),
    source: "control-plane",
    actor,
    purpose: "Knowledge retrieval",
    inputs: [payload.query],
    outputs: [`citations:${citation.sources.length}`],
    status: "success",
    trace: {
      trace_id: randomUUID(),
      span_id: randomUUID()
    }
  };

  upsertRun(run, { baseDir: runsBaseDir });

  return res.json(200, {
    result,
    citation_package: citation,
    citation_file: citationFile
  });
};

const handleEvaluation = async (req: RequestLike, res: ResponseLike) => {
  const actor = req.headers.get("x-actor") ?? "unknown";
  const role = req.headers.get("x-role") ?? "operator";
  const policyCheck = enforcePolicyAction(actor, role, "evaluation:score");
  if (!policyCheck.ok) {
    return res.json(403, { error: policyCheck.error });
  }

  const payload = (await parseJsonBody(req)) as EvaluationRequest | null;
  if (!payload) {
    return res.json(400, { error: "Missing evaluation payload" });
  }

  const evaluation: EvaluationResult = {
    object_type: "evaluation_result",
    schema_version: "1.0.0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    evaluation_result_id: `eval-${randomUUID()}`,
    target_ref: payload.target_ref,
    evaluator_id: payload.evaluator_id,
    score: payload.score,
    score_range: payload.score_range,
    passed: payload.score >= payload.score_range.min,
    evaluated_at: new Date().toISOString(),
    rubric: payload.rubric,
    metrics: payload.metrics,
    notes: payload.notes
  };

  persistFactoryObject(evaluation);

  const gateConfig = loadGateConfig(path.join(repoRoot, "artifacts", "evaluations", "gates.json"));
  const gateResults = applyEvaluationGates(evaluation.score, gateConfig);
  const gateFile = persistGateResults(evaluation.evaluation_result_id, gateResults);
  const requiredGatePass =
    gateResults.length === 0 || gateResults.filter((gate) => gate.rule.required).every((gate) => gate.passed);

  const run: RunRecord = {
    run_id: randomUUID(),
    timestamp: new Date().toISOString(),
    source: "control-plane",
    actor,
    purpose: "Evaluation scoring",
    inputs: [payload.target_ref],
    outputs: [`evaluation:${evaluation.evaluation_result_id}`, `gates:${gateResults.length}`],
    status: evaluation.passed && requiredGatePass ? "success" : "failure",
    trace: {
      trace_id: randomUUID(),
      span_id: randomUUID()
    }
  };

  upsertRun(run, { baseDir: runsBaseDir });

  return res.json(200, { evaluation, gate_results: gateResults, gate_file: gateFile });
};

const handleToolExecute = async (req: RequestLike, res: ResponseLike) => {
  const actor = req.headers.get("x-actor") ?? "unknown";
  const role = req.headers.get("x-role") ?? "operator";
  const policyCheck = enforcePolicyAction(actor, role, "tool:execute");
  if (!policyCheck.ok) {
    return res.json(403, { error: policyCheck.error });
  }

  const payload = (await parseJsonBody(req)) as ToolExecuteRequest | null;
  if (!payload) {
    return res.json(400, { error: "Missing tool payload" });
  }

  const runId = payload.run_id ?? randomUUID();
  const toolRuntime = buildToolRuntime();
  const result = await toolRuntime.execute({
    request_id: randomUUID(),
    run_id: runId,
    tool_id: payload.tool_id,
    requested_at: new Date().toISOString(),
    caller: payload.caller,
    input: payload.input,
    trace: {
      trace_id: randomUUID(),
      span_id: randomUUID()
    }
  });

  const toolRun: RunRecord = {
    run_id: runId,
    timestamp: new Date().toISOString(),
    source: "governed-execution",
    actor: payload.caller,
    purpose: `Tool execution:${payload.tool_id}`,
    inputs: [JSON.stringify(payload.input)],
    outputs: [`tool:${payload.tool_id}`, `status:${result.status}`],
    status: result.status === "success" ? "success" : "failure",
    trace: {
      trace_id: result.trace.trace_id,
      span_id: result.trace.span_id
    }
  };

  upsertRun(toolRun, { baseDir: runsBaseDir });

  return res.json(200, { result });
};

const handleRunRead = (req: RequestLike, res: ResponseLike) => {
  const actor = req.headers.get("x-actor") ?? "unknown";
  const role = req.headers.get("x-role") ?? "observer";
  const policyCheck = enforcePolicyAction(actor, role, "run:read");
  if (!policyCheck.ok) {
    return res.json(403, { error: policyCheck.error });
  }

  const runId = req.params.get("runId");
  if (!runId) {
    return res.json(400, { error: "Missing run id" });
  }

  try {
    const run = loadRun(runId, { baseDir: runsBaseDir });
    return res.json(200, { run, accessed_by: actor });
  } catch (error) {
    return res.json(404, { error: "Run not found", run_id: runId });
  }
};

const handlePolicyRead = (_req: RequestLike, res: ResponseLike) => {
  return res.json(200, { policy: governancePolicy });
};

const handleNotFound = (_req: RequestLike, res: ResponseLike) => {
  return res.json(404, { error: "Not found" });
};

type HeadersMap = Map<string, string>;

interface RequestLike {
  method: string | undefined;
  url: string | undefined;
  headers: HeadersMap;
  params: Map<string, string>;
  readBody: () => Promise<string>;
}

interface ResponseLike {
  json: (status: number, body: unknown) => void;
}

const parseUrl = (url: string) => {
  const parsed = new URL(url, "http://localhost");
  return parsed.pathname;
};

const matchRoute = (method: string | undefined, pathname: string): { handler: RouteHandler; params: Map<string, string> } => {
  if (method === "POST" && pathname === "/foundation/workflows/execute") {
    return { handler: handleWorkflowExecute, params: new Map() };
  }

  if (method === "POST" && pathname === "/foundation/connectors/ingest") {
    return { handler: handleConnectorIngest, params: new Map() };
  }

  if (method === "POST" && pathname === "/foundation/llm/execute") {
    return { handler: handleGatewayExecute, params: new Map() };
  }

  if (method === "POST" && pathname === "/foundation/retrieval/query") {
    return { handler: handleRetrievalQuery, params: new Map() };
  }

  if (method === "POST" && pathname === "/foundation/evaluations/score") {
    return { handler: handleEvaluation, params: new Map() };
  }

  if (method === "POST" && pathname === "/foundation/tools/execute") {
    return { handler: handleToolExecute, params: new Map() };
  }

  if (method === "GET" && pathname === "/foundation/policy") {
    return { handler: handlePolicyRead, params: new Map() };
  }

  const runMatch = pathname.match(/^\/foundation\/runs\/(?<runId>[\w-]+)$/);
  if (method === "GET" && runMatch?.groups?.runId) {
    return { handler: handleRunRead, params: new Map([['runId', runMatch.groups.runId]]) };
  }

  return { handler: handleNotFound, params: new Map() };
};

type RouteHandler = (req: RequestLike, res: ResponseLike) => Promise<void> | void;

const server = createServer(async (req, res) => {
  const method = req.method;
  const pathname = parseUrl(req.url ?? "/");
  const { handler, params } = matchRoute(method, pathname);

  const headers: HeadersMap = new Map();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers.set(key.toLowerCase(), value);
    }
  }

  const requestLike: RequestLike = {
    method,
    url: req.url,
    headers,
    params,
    readBody: () =>
      new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => {
          data += chunk;
        });
        req.on("end", () => resolve(data));
        req.on("error", (error) => reject(error));
      })
  };

  const responseLike: ResponseLike = {
    json: (status, body) => {
      const payload = JSON.stringify(body, null, 2);
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      });
      res.end(`${payload}\n`);
    }
  };

  try {
    await handler(requestLike, responseLike);
  } catch (error) {
    responseLike.json(500, { error: "Unexpected error" });
  }
});

const port = Number(process.env.FOUNDATION_PORT ?? 4040);

server.listen(port, () => {
  console.log(`Foundation service listening on http://localhost:${port}`);
});
