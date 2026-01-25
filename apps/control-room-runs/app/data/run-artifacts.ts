import runArtifactsJson from "./run-artifacts.json";

export type RunArtifact = {
  label: string;
  path: string;
  kind: string;
};

export type RunArtifactBundle = {
  run_id: string;
  inputs: RunArtifact[];
  outputs: RunArtifact[];
};

export const runArtifacts = runArtifactsJson as RunArtifactBundle[];
