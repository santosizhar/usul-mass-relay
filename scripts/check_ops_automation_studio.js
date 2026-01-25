#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const configSchemaPath = path.join(
  repoRoot,
  "projects",
  "ops-automation-studio",
  "configs",
  "project.config.schema.json"
);
const configPath = path.join(
  repoRoot,
  "projects",
  "ops-automation-studio",
  "configs",
  "project.config.json"
);
const playbookSchemaPath = path.join(
  repoRoot,
  "packages",
  "governance-contracts",
  "src",
  "agent-playbook.schema.json"
);
const integrationsSchemaPath = path.join(
  repoRoot,
  "projects",
  "ops-automation-studio",
  "integrations",
  "mock-integrations.schema.json"
);
const integrationsPath = path.join(
  repoRoot,
  "projects",
  "ops-automation-studio",
  "integrations",
  "mock-integrations.json"
);
const scenariosSchemaPath = path.join(
  repoRoot,
  "projects",
  "ops-automation-studio",
  "scenarios",
  "demo-scenarios.schema.json"
);
const scenariosPath = path.join(
  repoRoot,
  "projects",
  "ops-automation-studio",
  "scenarios",
  "demo-scenarios.json"
);

const configSchema = JSON.parse(fs.readFileSync(configSchemaPath, "utf8"));
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const playbookSchema = JSON.parse(fs.readFileSync(playbookSchemaPath, "utf8"));
const integrationsSchema = JSON.parse(fs.readFileSync(integrationsSchemaPath, "utf8"));
const integrationsCatalog = JSON.parse(fs.readFileSync(integrationsPath, "utf8"));
const scenariosSchema = JSON.parse(fs.readFileSync(scenariosSchemaPath, "utf8"));
const scenariosCatalog = JSON.parse(fs.readFileSync(scenariosPath, "utf8"));

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

  if (schemaNode.type === "boolean" && typeof value !== "boolean") {
    errors.push(`${location} should be a boolean`);
  }
};

validate(configSchema, config, "project.config");
validate(integrationsSchema, integrationsCatalog, "integrations.catalog");
validate(scenariosSchema, scenariosCatalog, "scenarios.catalog");

const integrationIds = new Set();
if (Array.isArray(integrationsCatalog.integrations)) {
  integrationsCatalog.integrations.forEach((integration) => {
    if (typeof integration.integration_id === "string") {
      integrationIds.add(integration.integration_id);
    }
  });
}

const scenarioIds = new Set();
if (Array.isArray(scenariosCatalog.scenarios)) {
  scenariosCatalog.scenarios.forEach((scenario) => {
    if (typeof scenario.scenario_id === "string") {
      scenarioIds.add(scenario.scenario_id);
    }
  });
}

const workflowPaths = new Map();
if (Array.isArray(config.workflows)) {
  config.workflows.forEach((workflow) => {
    if (typeof workflow.path === "string") {
      workflowPaths.set(workflow.workflow_id, workflow.path);
      const workflowPath = path.join(repoRoot, workflow.path);
      if (!fs.existsSync(workflowPath)) {
        errors.push(`Workflow file missing: ${workflow.path}`);
      }
    }
  });
}

if (Array.isArray(config.integrations)) {
  config.integrations.forEach((integrationEntry) => {
    if (typeof integrationEntry.path === "string") {
      const integrationPath = path.join(repoRoot, integrationEntry.path);
      if (!fs.existsSync(integrationPath)) {
        errors.push(`Integration file missing: ${integrationEntry.path}`);
      }
    }
    if (
      typeof integrationEntry.integration_id === "string" &&
      !integrationIds.has(integrationEntry.integration_id)
    ) {
      errors.push(
        `Integration id missing in catalog: ${integrationEntry.integration_id}`
      );
    }
  });
}

if (Array.isArray(config.scenarios)) {
  config.scenarios.forEach((scenarioEntry) => {
    if (typeof scenarioEntry.path === "string") {
      const scenarioPath = path.join(repoRoot, scenarioEntry.path);
      if (!fs.existsSync(scenarioPath)) {
        errors.push(`Scenario file missing: ${scenarioEntry.path}`);
      }
    }
    if (
      typeof scenarioEntry.scenario_id === "string" &&
      !scenarioIds.has(scenarioEntry.scenario_id)
    ) {
      errors.push(`Scenario id missing in catalog: ${scenarioEntry.scenario_id}`);
    }
  });
}

const workflowIds = new Set();
if (Array.isArray(config.workflows)) {
  config.workflows.forEach((workflow) => {
    if (typeof workflow.workflow_id === "string") {
      workflowIds.add(workflow.workflow_id);
    }
  });
}

const playbookEntries = Array.isArray(config.playbooks) ? config.playbooks : [];
playbookEntries.forEach((playbookEntry) => {
  if (typeof playbookEntry.path !== "string") {
    return;
  }

  const playbookPath = path.join(repoRoot, playbookEntry.path);
  if (!fs.existsSync(playbookPath)) {
    errors.push(`Playbook file missing: ${playbookEntry.path}`);
    return;
  }

  const playbook = JSON.parse(fs.readFileSync(playbookPath, "utf8"));
  validate(playbookSchema, playbook, `playbook.${playbookEntry.playbook_id}`);

  if (playbook.playbook_id !== playbookEntry.playbook_id) {
    errors.push(
      `Playbook id mismatch: config ${playbookEntry.playbook_id} vs file ${playbook.playbook_id}`
    );
  }

  if (playbook.runtime?.lane !== playbookEntry.lane) {
    errors.push(
      `Playbook lane mismatch for ${playbookEntry.playbook_id}: ` +
        `${playbookEntry.lane} vs ${playbook.runtime?.lane}`
    );
  }

  if (typeof playbook.runtime?.entrypoint === "string") {
    const entryPath = path.join(repoRoot, playbook.runtime.entrypoint);
    if (!fs.existsSync(entryPath)) {
      errors.push(`Playbook entrypoint missing: ${playbook.runtime.entrypoint}`);
    }
  }
});

if (Array.isArray(scenariosCatalog.scenarios)) {
  scenariosCatalog.scenarios.forEach((scenario) => {
    if (Array.isArray(scenario.playbooks)) {
      scenario.playbooks.forEach((playbookId) => {
        if (!playbookEntries.some((entry) => entry.playbook_id === playbookId)) {
          errors.push(`Scenario references unknown playbook: ${playbookId}`);
        }
      });
    }
    if (Array.isArray(scenario.workflows)) {
      scenario.workflows.forEach((workflowId) => {
        if (!workflowIds.has(workflowId)) {
          errors.push(`Scenario references unknown workflow: ${workflowId}`);
        }
      });
    }
    if (Array.isArray(scenario.mock_integrations)) {
      scenario.mock_integrations.forEach((integrationId) => {
        if (!integrationIds.has(integrationId)) {
          errors.push(`Scenario references unknown integration: ${integrationId}`);
        }
      });
    }
  });
}

if (errors.length > 0) {
  console.error("Ops Automation Studio checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Ops Automation Studio checks passed.");
