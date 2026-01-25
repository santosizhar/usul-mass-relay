import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { GovernanceLevelPolicy, GovernancePolicy } from "../../governance-policy/src/governance-policy";
import { buildRunSummary } from "../../run-instrumentation/src/run-instrumentation";
import { RunRecord } from "../../run-model/src/run";
import { loadRun, persistRun } from "../../run-persistence/src/run-store";

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

const governancePolicy: GovernancePolicy = {
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
      allowed_actions: ["run:read"],
      requires_human_review: false,
      requires_run_logging: true,
      restricted_data: ["restricted"]
    },
    {
      level: "A1",
      name: "Operator",
      description: "Workflow execution within policy.",
      allowed_actions: ["run:read", "workflow:execute"],
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

const workflows: WorkflowDefinition[] = [
  {
    workflow_id: "foundation-trace-demo",
    purpose: "Demonstrate a governed workflow execution trace.",
    steps: ["validate-identity", "apply-policy", "execute-workflow", "record-run"]
  }
];

const findPolicyForRole = (role: string): GovernanceLevelPolicy | undefined => {
  const level = roleToLevel[role];
  return governancePolicy.levels.find((item) => item.level === level);
};

const parseJsonBody = async (req: RequestLike): Promise<unknown> => {
  const body = await req.readBody();
  if (!body) {
    return null;
  }

  return JSON.parse(body);
};

const createRunRecord = (workflow: WorkflowDefinition, request: WorkflowRequest, actor: ActorContext): RunRecord => {
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
  const policy = findPolicyForRole(role);

  if (!policy) {
    return res.json(403, { error: "Unknown role", role });
  }

  const payload = (await parseJsonBody(req)) as WorkflowRequest | null;
  if (!payload) {
    return res.json(400, { error: "Missing workflow payload" });
  }

  if (!policy.allowed_actions.includes(payload.action)) {
    return res.json(403, {
      error: "Action denied",
      action: payload.action,
      role,
      allowed_actions: policy.allowed_actions
    });
  }

  const workflow = workflows.find((item) => item.workflow_id === payload.workflow_id);
  if (!workflow) {
    return res.json(404, { error: "Unknown workflow", workflow_id: payload.workflow_id });
  }

  const run = createRunRecord(workflow, payload, { actor, role });
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

const handleRunRead = (req: RequestLike, res: ResponseLike) => {
  const actor = req.headers.get("x-actor") ?? "unknown";
  const role = req.headers.get("x-role") ?? "observer";
  const policy = findPolicyForRole(role);

  if (!policy) {
    return res.json(403, { error: "Unknown role", role });
  }

  if (!policy.allowed_actions.includes("run:read")) {
    return res.json(403, { error: "Action denied", action: "run:read", role });
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
