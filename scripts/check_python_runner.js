#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const requestSchemaPath = path.join(
  repoRoot,
  "packages",
  "python-runner",
  "src",
  "python-runner.request.schema.json"
);
const responseSchemaPath = path.join(
  repoRoot,
  "packages",
  "python-runner",
  "src",
  "python-runner.response.schema.json"
);
const requestSamplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "python.runner.request.sample.json"
);
const responseSamplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "python.runner.response.sample.json"
);

const requestSchema = JSON.parse(fs.readFileSync(requestSchemaPath, "utf8"));
const responseSchema = JSON.parse(fs.readFileSync(responseSchemaPath, "utf8"));
const requestSample = JSON.parse(fs.readFileSync(requestSamplePath, "utf8"));
const responseSample = JSON.parse(fs.readFileSync(responseSamplePath, "utf8"));

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

validate(requestSchema, requestSample, "python.runner.request");
validate(responseSchema, responseSample, "python.runner.response");

if (requestSample.request_id !== responseSample.request_id) {
  errors.push("Request and response request_id values must match");
}

if (requestSample.run_id !== responseSample.run_id) {
  errors.push("Request and response run_id values must match");
}

if (responseSample.status === "failure" && !responseSample.error) {
  errors.push("Failure responses must include an error object");
}

const startedAt = Date.parse(responseSample.started_at);
const finishedAt = Date.parse(responseSample.finished_at);
if (Number.isFinite(startedAt) && Number.isFinite(finishedAt) && finishedAt < startedAt) {
  errors.push("finished_at must be greater than or equal to started_at");
}

if (errors.length > 0) {
  console.error("Python runner checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Python runner checks passed.");
