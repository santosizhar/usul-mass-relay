import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { GovernanceLevel, GovernanceLevelPolicy, GovernancePolicy } from "./governance-policy";

export interface PolicyEnforcementRequest {
  policy: GovernancePolicy;
  level: GovernanceLevel;
  actor: string;
  role: string;
  action: string;
  resource?: string;
  metadata?: Record<string, string>;
}

export interface PolicyDecision {
  allowed: boolean;
  level: GovernanceLevel;
  requires_human_review: boolean;
  requires_run_logging: boolean;
  restricted_data: string[];
  violations: string[];
  decided_at: string;
}

export interface PolicyAuditRecord {
  audit_id: string;
  policy_id: string;
  level: GovernanceLevel;
  actor: string;
  role: string;
  action: string;
  resource?: string;
  allowed: boolean;
  violations: string[];
  decided_at: string;
  metadata?: Record<string, string>;
}

export interface PolicyAuditOptions {
  baseDir?: string;
}

const resolveLevel = (policy: GovernancePolicy, level: GovernanceLevel): GovernanceLevelPolicy | undefined => {
  return policy.levels.find((entry) => entry.level === level);
};

export const evaluatePolicy = (request: PolicyEnforcementRequest): PolicyDecision => {
  const levelPolicy = resolveLevel(request.policy, request.level);
  const decidedAt = new Date().toISOString();

  if (!levelPolicy) {
    return {
      allowed: false,
      level: request.level,
      requires_human_review: true,
      requires_run_logging: true,
      restricted_data: [],
      violations: [`Missing policy level ${request.level}`],
      decided_at: decidedAt
    };
  }

  const violations: string[] = [];
  if (!levelPolicy.allowed_actions.includes(request.action)) {
    violations.push(`Action ${request.action} is not allowed for level ${request.level}`);
  }

  return {
    allowed: violations.length === 0,
    level: request.level,
    requires_human_review: levelPolicy.requires_human_review,
    requires_run_logging: levelPolicy.requires_run_logging,
    restricted_data: levelPolicy.restricted_data,
    violations,
    decided_at: decidedAt
  };
};

export const writePolicyAudit = (
  decision: PolicyDecision,
  request: PolicyEnforcementRequest,
  options: PolicyAuditOptions = {}
): string => {
  const baseDir = options.baseDir ?? path.resolve(process.cwd(), "artifacts", "policy-audit");
  const audit: PolicyAuditRecord = {
    audit_id: randomUUID(),
    policy_id: request.policy.policy_id,
    level: request.level,
    actor: request.actor,
    role: request.role,
    action: request.action,
    resource: request.resource,
    allowed: decision.allowed,
    violations: decision.violations,
    decided_at: decision.decided_at,
    metadata: request.metadata
  };

  fs.mkdirSync(baseDir, { recursive: true });
  const filePath = path.join(baseDir, `${audit.audit_id}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

  return filePath;
};
