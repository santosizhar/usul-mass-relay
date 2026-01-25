#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const requestSchemaPath = path.join(
  repoRoot,
  "packages",
  "governance-contracts",
  "src",
  "hitl-request.schema.json"
);
const auditSchemaPath = path.join(
  repoRoot,
  "packages",
  "governance-contracts",
  "src",
  "audit-log.schema.json"
);
const requestSamplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "hitl.request.sample.json"
);
const auditSamplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "audit.log.sample.json"
);

const requestSchema = JSON.parse(fs.readFileSync(requestSchemaPath, "utf8"));
const auditSchema = JSON.parse(fs.readFileSync(auditSchemaPath, "utf8"));
const requestSample = JSON.parse(fs.readFileSync(requestSamplePath, "utf8"));
const auditSample = JSON.parse(fs.readFileSync(auditSamplePath, "utf8"));

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

  if (schemaNode.type === "boolean" && typeof value !== "boolean") {
    errors.push(`${location} should be a boolean`);
  }
};

validate(requestSchema, requestSample, "hitl.request");

if (!Array.isArray(auditSample) || auditSample.length === 0) {
  errors.push("Audit log sample must be a non-empty array");
} else {
  auditSample.forEach((entry, index) => {
    validate(auditSchema, entry, `audit.log[${index}]`);
  });
}

if (requestSample.decision) {
  if (requestSample.status !== requestSample.decision.decision) {
    errors.push("HITL request status must match decision when a decision is present");
  }
}

const auditRunIds = new Set((auditSample ?? []).map((entry) => entry.run_id));
if (!auditRunIds.has(requestSample.run_id)) {
  errors.push("Audit log sample must reference the HITL request run_id");
}

if (errors.length > 0) {
  console.error("HITL audit checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("HITL audit checks passed.");
