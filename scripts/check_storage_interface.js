#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const schemaPath = path.join(
  repoRoot,
  "packages",
  "storage-interfaces",
  "src",
  "storage-interfaces.schema.json"
);
const samplePath = path.join(
  repoRoot,
  "artifacts",
  "examples",
  "storage.interface.sample.json"
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
    return;
  }

  if (schemaNode.type === "number") {
    if (typeof value !== "number" || Number.isNaN(value)) {
      errors.push(`${location} should be a number`);
    }
    return;
  }

  if (schemaNode.type === "boolean") {
    if (typeof value !== "boolean") {
      errors.push(`${location} should be a boolean`);
    }
  }
};

validate(schema, sample, "storage.catalog");

const providerId = sample.provider?.provider_id;
if (providerId) {
  sample.namespaces.forEach((namespace, index) => {
    if (namespace.provider_id !== providerId) {
      errors.push(`namespaces[${index}].provider_id does not match provider.provider_id`);
    }
  });
}

const namespaceIds = new Set(sample.namespaces.map((namespace) => namespace.namespace_id));
sample.objects.forEach((object, index) => {
  if (!namespaceIds.has(object.namespace_id)) {
    errors.push(`objects[${index}].namespace_id is not defined in namespaces`);
  }
});

if (errors.length > 0) {
  console.error("Storage interface checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Storage interface checks passed.");
