import fs from "fs";
import path from "path";

import { approvals, type ApprovalRequest } from "./approvals";
import { exceptions, type ExceptionRequest } from "./exceptions";
import { policies, type PolicyRecord } from "./policies";
import { runSummaries as runSeed, type RunSummary } from "./run-summaries";

type RunRecord = {
  run_id: string;
  timestamp: string;
  source: string;
  actor: string;
  purpose: string;
  status: "success" | "failure" | "partial";
  trace?: {
    trace_id: string;
  };
  inputs?: string[];
};

type RuntimeSeed = {
  runs: RunSummary[];
  approvals: ApprovalRequest[];
  exceptions: ExceptionRequest[];
  policies: PolicyRecord[];
};

type GovernancePolicy = {
  policy_id: string;
  name: string;
  owner: string;
  levels: Array<{
    level: PolicyRecord["level"];
    description: string;
  }>;
};

const resolveRunsDir = (): string => {
  if (process.env.MASS_RELAY_RUNS_DIR) {
    return process.env.MASS_RELAY_RUNS_DIR;
  }

  const repoRoot = path.resolve(process.cwd(), "..", "..");
  return path.join(repoRoot, "artifacts", "runs");
};

const resolvePoliciesDir = (): string => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  return path.join(repoRoot, "artifacts", "governance", "policies");
};

const mapRunStatus = (status: RunRecord["status"]): RunSummary["status"] => {
  if (status === "success") {
    return "success";
  }
  if (status === "failure") {
    return "failed";
  }
  return "awaiting_exception";
};

const parseProject = (inputs: string[] | undefined): string => {
  if (!inputs) {
    return "foundation";
  }
  const projectToken = inputs.find((item) => item.startsWith("project:"));
  return projectToken ? projectToken.replace("project:", "") : "foundation";
};

const loadRunSummaries = (): RunSummary[] => {
  const runsDir = resolveRunsDir();
  if (!fs.existsSync(runsDir)) {
    return runSeed;
  }

  const runIds = fs
    .readdirSync(runsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const summaries = runIds
    .map((runId) => {
      const runFile = path.join(runsDir, runId, "run.json");
      if (!fs.existsSync(runFile)) {
        return null;
      }
      const parsed = JSON.parse(fs.readFileSync(runFile, "utf8")) as RunRecord;
      return {
        run_id: parsed.run_id,
        timestamp: parsed.timestamp,
        source: parsed.source,
        actor: parsed.actor,
        purpose: parsed.purpose,
        status: mapRunStatus(parsed.status),
        trace_id: parsed.trace?.trace_id ?? "trace-missing",
        project: parseProject(parsed.inputs)
      };
    })
    .filter((summary): summary is RunSummary => Boolean(summary));

  return summaries.length > 0 ? summaries : runSeed;
};

const mapGovernancePolicy = (policy: GovernancePolicy): PolicyRecord[] => {
  return policy.levels.map((level) => ({
    policy_id: `${policy.policy_id}-${level.level}`,
    name: policy.name,
    owner: policy.owner,
    level: level.level,
    scope: "foundation",
    description: level.description,
    enforcement: "active",
    last_reviewed: new Date().toISOString(),
    review_status: "stable"
  }));
};

const loadPolicyRecords = (): PolicyRecord[] => {
  const policiesDir = resolvePoliciesDir();
  if (!fs.existsSync(policiesDir)) {
    return policies;
  }
  const files = fs
    .readdirSync(policiesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(policiesDir, entry.name));

  const loaded = files.flatMap((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as GovernancePolicy;
    return mapGovernancePolicy(parsed);
  });

  return loaded.length > 0 ? loaded : policies;
};

export const loadRuntimeSeeds = async (): Promise<RuntimeSeed> => {
  return {
    runs: loadRunSummaries(),
    approvals,
    exceptions,
    policies: loadPolicyRecords()
  };
};
