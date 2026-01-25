import fs from "node:fs";
import path from "node:path";

export interface EvaluationGateRule {
  gate_id: string;
  name: string;
  min_score: number;
  max_score: number;
  required: boolean;
}

export interface EvaluationGateConfig {
  config_id: string;
  version: string;
  updated_at: string;
  rules: EvaluationGateRule[];
}

export interface EvaluationGateResult {
  gate_id: string;
  passed: boolean;
  score: number;
  evaluated_at: string;
  rule: EvaluationGateRule;
}

const DEFAULT_GATE_PATH = path.resolve(process.cwd(), "artifacts", "evaluations", "gates.json");

export const loadGateConfig = (gatePath = DEFAULT_GATE_PATH): EvaluationGateConfig | null => {
  if (!fs.existsSync(gatePath)) {
    return null;
  }
  const raw = fs.readFileSync(gatePath, "utf8");
  return JSON.parse(raw) as EvaluationGateConfig;
};

export const applyEvaluationGates = (
  score: number,
  gateConfig: EvaluationGateConfig | null
): EvaluationGateResult[] => {
  if (!gateConfig) {
    return [];
  }
  const now = new Date().toISOString();
  return gateConfig.rules.map((rule) => ({
    gate_id: rule.gate_id,
    passed: score >= rule.min_score && score <= rule.max_score,
    score,
    evaluated_at: now,
    rule
  }));
};

export const persistGateResults = (
  runId: string,
  results: EvaluationGateResult[],
  baseDir = path.resolve(process.cwd(), "artifacts", "evaluations")
): string => {
  fs.mkdirSync(baseDir, { recursive: true });
  const filePath = path.join(baseDir, `gate-results-${runId}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify({ run_id: runId, results }, null, 2)}\n`, "utf8");
  return filePath;
};
