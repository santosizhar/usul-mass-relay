export type PlaybookLane = "control-plane" | "governed-execution";
export type GovernanceLevel = "A0" | "A1" | "A2" | "A3";

export interface PlaybookRuntime {
  lane: PlaybookLane;
  entrypoint: string;
}

export interface PlaybookGovernance {
  policy_id: string;
  level: GovernanceLevel;
}

export interface PlaybookStep {
  step_id: string;
  name: string;
  purpose: string;
  action: string;
  inputs: string[];
  outputs: string[];
  requires_human_approval: boolean;
}

export interface AgentPlaybook {
  playbook_id: string;
  name: string;
  version: string;
  description: string;
  owner: string;
  created_at: string;
  updated_at: string;
  runtime: PlaybookRuntime;
  inputs: string[];
  outputs: string[];
  governance: PlaybookGovernance;
  steps: PlaybookStep[];
}
