#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const schemaPath = path.join(
  repoRoot,
  "packages",
  "run",
  "src",
  "run.schema.json"
);
const sampleRunPath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "run.sample.json"
);
const persistedRunPath = path.join(
  repoRoot,
  "artifacts",
  "runs",
  "01J8Y3H9ZV3EN8R1B0C1R2D3E4",
  "run.json"
);
const exportSamplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "run.export.sample.jsonl"
);

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const errors = [];

const isDateTime = (value) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
};

const validate = (schemaNode, value, location) => {
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
    Object.keys(value).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(properties, key)) {
        if (schemaNode.additionalProperties === false) {
          errors.push(`${location}.${key} is not allowed`);
        }
        return;
      }
      validate(properties[key], value[key], `${location}.${key}`);
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
      validate(itemsSchema, item, `${location}[${index}]`);
    });
    return;
  }

  if (schemaNode.type === "string") {
    if (typeof value !== "string") {
      errors.push(`${location} should be a string`);
      return;
    }
    if (schemaNode.minLength && value.length < schemaNode.minLength) {
      errors.push(`${location} should be at least ${schemaNode.minLength} characters`);
    }
    if (schemaNode.enum && !schemaNode.enum.includes(value)) {
      errors.push(`${location} should be one of ${schemaNode.enum.join(", ")}`);
    }
    if (schemaNode.pattern) {
      const regex = new RegExp(schemaNode.pattern);
      if (!regex.test(value)) {
        errors.push(`${location} does not match pattern ${schemaNode.pattern}`);
      }
    }
    if (schemaNode.format === "date-time" && !isDateTime(value)) {
      errors.push(`${location} should be an ISO-8601 date-time string`);
    }
  }
};

const sortKeys = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeys(value[key]);
        return acc;
      }, {});
  }
  return value;
};

const orderRunRecord = (run) => ({
  run_id: run.run_id,
  timestamp: run.timestamp,
  source: run.source,
  actor: run.actor,
  purpose: run.purpose,
  inputs: run.inputs,
  outputs: run.outputs,
  status: run.status,
  trace: run.trace
});

const runSample = JSON.parse(fs.readFileSync(sampleRunPath, "utf8"));
validate(schema, runSample, "run.sample");

const persistedRun = JSON.parse(fs.readFileSync(persistedRunPath, "utf8"));
validate(schema, persistedRun, "run.persisted");

const normalizedSample = JSON.stringify(sortKeys(runSample));
const normalizedPersisted = JSON.stringify(sortKeys(persistedRun));
if (normalizedSample !== normalizedPersisted) {
  errors.push("Persisted run does not match sample run record");
}

const exportLines = fs
  .readFileSync(exportSamplePath, "utf8")
  .split("\n")
  .filter((line) => line.trim().length > 0);

if (exportLines.length === 0) {
  errors.push("Export sample is empty");
} else {
  exportLines.forEach((line, index) => {
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      errors.push(`Export sample line ${index + 1} is not valid JSON`);
      return;
    }
    validate(schema, parsed, `run.export[${index}]`);
  });

  const expectedLine = JSON.stringify(orderRunRecord(runSample));
  if (exportLines[0] !== expectedLine) {
    errors.push("Export sample does not match ordered run record");
  }
}

if (errors.length > 0) {
  console.error("Run artifact checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Run artifact checks passed.");
