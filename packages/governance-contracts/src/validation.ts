import agentPlaybookSchema from "./agent-playbook.schema.json";
import governancePolicySchema from "./governance-policy.schema.json";
import { AgentPlaybook } from "./agent-playbook";
import { GovernancePolicy } from "./governance-policy";
import { SchemaValidationResult, validateAgainstSchema } from "./schema-validation";

const buildError = (label: string, result: SchemaValidationResult): Error => {
  const details = result.issues.map((issue) => `${issue.path} ${issue.message}`).join("; ");
  return new Error(`${label} validation failed: ${details}`);
};

export const validateAgentPlaybook = (playbook: AgentPlaybook): SchemaValidationResult => {
  return validateAgainstSchema(agentPlaybookSchema, playbook, "agent-playbook");
};

export const assertAgentPlaybook = (playbook: AgentPlaybook): void => {
  const result = validateAgentPlaybook(playbook);
  if (!result.valid) {
    throw buildError("Agent playbook", result);
  }
};

export const validateGovernancePolicy = (policy: GovernancePolicy): SchemaValidationResult => {
  return validateAgainstSchema(governancePolicySchema, policy, "governance-policy");
};

export const assertGovernancePolicy = (policy: GovernancePolicy): void => {
  const result = validateGovernancePolicy(policy);
  if (!result.valid) {
    throw buildError("Governance policy", result);
  }
};
