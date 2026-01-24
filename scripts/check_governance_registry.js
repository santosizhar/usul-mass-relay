#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const schemaPath = path.join(
  repoRoot,
  "packages",
  "governance-registry",
  "src",
  "registry.schema.json"
);
const samplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "governance.registry.sample.json"
);

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const sample = JSON.parse(fs.readFileSync(samplePath, "utf8"));

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

if (!Array.isArray(sample) || sample.length === 0) {
  errors.push("Governance registry sample must be a non-empty array");
} else {
  sample.forEach((record, index) => {
    validate(schema, record, `registry[${index}]`);
    const versions = record.versions ?? [];
    const versionSet = new Set();
    versions.forEach((version) => {
      if (versionSet.has(version.version)) {
        errors.push(`Duplicate version ${version.version} in ${record.registry_id}`);
      }
      versionSet.add(version.version);
    });
  });
}

if (errors.length > 0) {
  console.error("Governance registry checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Governance registry checks passed.");
