#!/usr/bin/env bash
set -euo pipefail

required_dirs=(apps packages projects docs artifacts scripts)
required_files=(
  README.md
  docs/terminology.md
  docs/governance.md
  docs/run-artifact-conventions.md
  docs/foundation-tracks-development/sprint-a1-a2.md
  docs/foundation-tracks-development/sprint-a3-a4.md
  docs/foundation-tracks-development/sprint-a5.md
  docs/foundation-tracks-development/sprint-b1-b2.md
  docs/foundation-tracks-development/sprint-b3-b4.md
  docs/foundation-tracks-development/sprint-b5.md
  docs/foundation-tracks-development/sprint-c1-c2.md
  docs/foundation-tracks-development/sprint-c3-c4.md
  docs/foundation-tracks-development/sprint-c5.md
  docs/foundation-tracks-development/sprint-d1-d2.md
  docs/foundation-tracks-development/sprint-d3-d4.md
  docs/foundation-tracks-development/sprint-d5.md
  docs/foundation-tracks-development/sprint-e1-e2.md
  docs/foundation-tracks-development/sprint-e3-e4.md
  docs/foundation-tracks-development/sprint-e5.md
  docs/foundation-tracks-development/sprint-f1-f2.md
  docs/foundation-tracks-development/sprint-f3-f4.md
  docs/foundation-tracks-development/sprint-f5.md
  docs/foundation-tracks-development/sprint-g1-g2.md
  docs/foundation-tracks-development/sprint-g3-g4.md
  docs/foundation-tracks-development/sprint-g5.md
  docs/foundation-tracks-development/sprint-h1-h2.md
  docs/foundation-tracks-development/sprint-h3-h4.md
  docs/foundation-tracks-development/sprint-h5.md
  docs/foundation-tracks-development/sprint-z1.md
  docs/foundation-tracks-development/mass-relay__roadmap.md
  docs/foundation-tracks-development/mass-relay__track-A__codex-checklist.md
  docs/foundation-tracks-development/mass-relay__track-B__codex-checklist.md
  docs/foundation-tracks-development/mass-relay__track-C__codex-checklist.md
  docs/foundation-tracks-development/mass-relay__track-D__codex-checklist.md
  docs/foundation-tracks-development/mass-relay__track-E__codex-checklist.md
  docs/foundation-tracks-development/mass-relay__track-F__codex-checklist.md
  docs/foundation-tracks-development/mass-relay__track-G__codex-checklist.md
  docs/foundation-tracks-development/mass-relay__track-H__codex-checklist.md
  docs/foundation-tracks-development/mass-relay__track-Z__codex-checklist.md
  artifacts/README.md
  artifacts/examples/run.sample.json
  artifacts/examples/run.export.sample.jsonl
  artifacts/examples/run.events.sample.json
  artifacts/examples/run.summary.sample.json
  artifacts/examples/agent-playbook.sample.json
  artifacts/examples/governance.policy.sample.json
  artifacts/examples/hitl.request.sample.json
  artifacts/examples/audit.log.sample.json
  artifacts/examples/governance.registry.sample.json
  artifacts/examples/tool.manifest.sample.json
  artifacts/examples/python.runner.request.sample.json
  artifacts/examples/python.runner.response.sample.json
  artifacts/examples/execution.sandbox.sample.json
  artifacts/examples/reference.tools.sample.json
  artifacts/runs/01J8Y3H9ZV3EN8R1B0C1R2D3E4/run.json
  packages/run-model/src/run.ts
  packages/run-model/src/run.schema.json
  packages/run-persistence/src/run-store.ts
  packages/run-persistence/src/run-exporter.ts
  packages/run-instrumentation/README.md
  packages/run-instrumentation/src/run-events.ts
  packages/run-instrumentation/src/run-instrumentation.ts
  packages/agent-playbook/README.md
  packages/agent-playbook/src/agent-playbook.ts
  packages/agent-playbook/src/agent-playbook.schema.json
  packages/governance-policy/README.md
  packages/governance-policy/src/governance-policy.ts
  packages/governance-policy/src/governance-policy.schema.json
  packages/hitl-audit/README.md
  packages/hitl-audit/src/hitl.ts
  packages/hitl-audit/src/hitl-request.schema.json
  packages/hitl-audit/src/audit-log.schema.json
  packages/governance-registry/README.md
  packages/governance-registry/src/registry.ts
  packages/governance-registry/src/registry.schema.json
  packages/tool-manifest/README.md
  packages/tool-manifest/src/tool-manifest.ts
  packages/tool-manifest/src/tool-manifest.schema.json
  packages/python-runner/README.md
  packages/python-runner/src/python-runner.ts
  packages/python-runner/src/python-runner.request.schema.json
  packages/python-runner/src/python-runner.response.schema.json
  packages/python-runner/src/runner.py
  packages/execution-sandbox/README.md
  packages/execution-sandbox/src/execution-sandbox.ts
  packages/execution-sandbox/src/execution-sandbox.schema.json
  packages/reference-tools/README.md
  packages/reference-tools/src/reference-tools.ts
  packages/reference-tools/src/reference-tools.schema.json
  packages/reference-tools/src/tools/fetch_object_storage.py
  packages/reference-tools/src/tools/record_run_summary.py
  projects/ops-automation-studio/README.md
  scripts/check_run_artifacts.js
  scripts/check_run_instrumentation.js
  scripts/check_agent_playbook.js
  scripts/check_governance_policy.js
  scripts/check_hitl_audit.js
  scripts/check_governance_registry.js
  scripts/check_tool_manifest.js
  scripts/check_python_runner.js
  scripts/check_execution_sandbox.js
  scripts/check_reference_tools.js
  scripts/check_schema_suite.js
  scripts/check_golden_runs.js
  scripts/check_ts_python_contracts.js
  scripts/check_boundary_enforcement.js
  apps/control-room-runs/README.md
  apps/control-room-runs/config/run-table.json
)

missing=0

for dir in "${required_dirs[@]}"; do
  if [[ ! -d "$dir" ]]; then
    echo "Missing directory: $dir"
    missing=1
  fi
done

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing file: $file"
    missing=1
  fi
done

if [[ $missing -ne 0 ]]; then
  echo "Repo integrity check failed."
  exit 1
fi

echo "Repo integrity check passed."
