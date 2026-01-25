export type GovernanceLevel = "A0" | "A1" | "A2" | "A3";

export interface GovernanceLevelPolicy {
  level: GovernanceLevel;
  name: string;
  description: string;
  allowed_actions: string[];
  requires_human_review: boolean;
  requires_run_logging: boolean;
  restricted_data: string[];
}

export interface GovernancePolicy {
  policy_id: string;
  name: string;
  version: string;
  owner: string;
  created_at: string;
  updated_at: string;
  levels: GovernanceLevelPolicy[];
  escalation_path: GovernanceLevel[];
}
