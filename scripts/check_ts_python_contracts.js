#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const toolManifestPath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "tool.manifest.sample.json"
);
const runnerRequestPath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "python.runner.request.sample.json"
);
const runnerResponsePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "python.runner.response.sample.json"
);

const toolManifest = JSON.parse(fs.readFileSync(toolManifestPath, "utf8"));
const runnerRequest = JSON.parse(fs.readFileSync(runnerRequestPath, "utf8"));
const runnerResponse = JSON.parse(fs.readFileSync(runnerResponsePath, "utf8"));

const errors = [];

const validateAgainstSchema = (schemaNode, value, location) => {
  if (!schemaNode) {
    return;
  }

  if (schemaNode.type === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`${location} should be an object`);
      return;
    }
    const required = schemaNode.required ?? [];
    required.forEach((key) => {
      if (!(key in value)) {
        errors.push(`${location}.${key} is required`);
      }
    });

    const properties = schemaNode.properties ?? {};
    Object.keys(properties).forEach((key) => {
      if (key in value) {
        validateAgainstSchema(properties[key], value[key], `${location}.${key}`);
      }
    });

    return;
  }

  if (schemaNode.type === "array") {
    if (!Array.isArray(value)) {
      errors.push(`${location} should be an array`);
      return;
    }
    const itemsSchema = schemaNode.items;
    value.forEach((item, index) => {
      validateAgainstSchema(itemsSchema, item, `${location}[${index}]`);
    });
    return;
  }

  if (schemaNode.type === "string") {
    if (typeof value !== "string") {
      errors.push(`${location} should be a string`);
    }
    if (schemaNode.enum && !schemaNode.enum.includes(value)) {
      errors.push(`${location} should be one of ${schemaNode.enum.join(", ")}`);
    }
  }

  if (schemaNode.type === "number") {
    if (typeof value !== "number") {
      errors.push(`${location} should be a number`);
    }
  }
};

const tool = (toolManifest.tools ?? []).find(
  (entry) => entry.tool_id === runnerRequest.tool_id
);

if (!tool) {
  errors.push("Runner request tool_id not found in tool manifest");
} else {
  if (runnerRequest.tool_version !== tool.version) {
    errors.push("Runner request tool_version does not match tool manifest version");
  }

  if (JSON.stringify(runnerRequest.governance) !== JSON.stringify(tool.governance)) {
    errors.push("Runner request governance does not match tool manifest governance");
  }

  if (runnerRequest.timeout_seconds !== tool.constraints?.timeout_seconds) {
    errors.push("Runner request timeout_seconds does not match tool manifest constraints");
  }

  validateAgainstSchema(tool.contract?.request_schema, runnerRequest.input, "runner.request.input");
  validateAgainstSchema(
    tool.contract?.response_schema,
    runnerResponse.output,
    "runner.response.output"
  );
}

if (runnerRequest.request_id !== runnerResponse.request_id) {
  errors.push("Runner response request_id does not match request");
}

if (runnerRequest.run_id !== runnerResponse.run_id) {
  errors.push("Runner response run_id does not match request");
}

if (runnerRequest.tool_id !== runnerResponse.tool_id) {
  errors.push("Runner response tool_id does not match request");
}

if (runnerRequest.tool_version !== runnerResponse.tool_version) {
  errors.push("Runner response tool_version does not match request");
}

if (errors.length > 0) {
  console.error("TS/Python contract checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("TS/Python contract checks passed.");
