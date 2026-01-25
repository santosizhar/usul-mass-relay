import executionSandboxSchema from "./execution-sandbox.schema.json";
import toolManifestSchema from "./tool-manifest.schema.json";
import { ExecutionSandbox } from "./execution-sandbox";
import { ToolManifest } from "./tool-manifest";
import { SchemaValidationResult, validateAgainstSchema } from "./schema-validation";

const buildError = (label: string, result: SchemaValidationResult): Error => {
  const details = result.issues.map((issue) => `${issue.path} ${issue.message}`).join("; ");
  return new Error(`${label} validation failed: ${details}`);
};

export const validateExecutionSandbox = (sandbox: ExecutionSandbox): SchemaValidationResult => {
  return validateAgainstSchema(executionSandboxSchema, sandbox, "execution-sandbox");
};

export const assertExecutionSandbox = (sandbox: ExecutionSandbox): void => {
  const result = validateExecutionSandbox(sandbox);
  if (!result.valid) {
    throw buildError("Execution sandbox", result);
  }
};

export const validateToolManifest = (manifest: ToolManifest): SchemaValidationResult => {
  return validateAgainstSchema(toolManifestSchema, manifest, "tool-manifest");
};

export const assertToolManifest = (manifest: ToolManifest): void => {
  const result = validateToolManifest(manifest);
  if (!result.valid) {
    throw buildError("Tool manifest", result);
  }
};
