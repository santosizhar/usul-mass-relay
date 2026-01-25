import playbooksJson from "./playbooks.json";

export type PlaybookRuntime = {
  lane: "control-plane" | "governed-execution";
  entrypoint: string;
};

export type PlaybookGovernance = {
  policy_id: string;
  level: "A0" | "A1" | "A2" | "A3";
};

export type PlaybookStep = {
  step_id: string;
  name: string;
  purpose: string;
  action: string;
  inputs: string[];
  outputs: string[];
  requires_human_approval: boolean;
};

export type AgentPlaybook = {
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
};

export const playbooks = playbooksJson as AgentPlaybook[];
