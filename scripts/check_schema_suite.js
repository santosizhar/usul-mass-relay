#!/usr/bin/env node

const { execFileSync } = require("child_process");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const checks = [
  "check_agent_playbook.js",
  "check_governance_policy.js",
  "check_hitl_audit.js",
  "check_governance_registry.js",
  "check_tool_manifest.js",
  "check_python_runner.js",
  "check_execution_sandbox.js",
  "check_reference_tools.js",
  "check_storage_interface.js",
  "check_run_storage.js",
  "check_playbook_persistence.js",
  "check_project_config_persistence.js",
  "check_run_artifacts.js"
];

const failures = [];

checks.forEach((script) => {
  const scriptPath = path.join(repoRoot, "scripts", script);
  try {
    execFileSync(process.execPath, [scriptPath], { stdio: "inherit" });
  } catch (error) {
    failures.push(script);
  }
});

if (failures.length > 0) {
  console.error("Schema suite checks failed:");
  failures.forEach((script) => console.error(`- ${script}`));
  process.exit(1);
}

console.log("Schema suite checks passed.");
