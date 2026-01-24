#!/usr/bin/env bash
set -euo pipefail

required_dirs=(apps packages projects docs artifacts scripts)
required_files=(
  README.md
  docs/terminology.md
  docs/governance.md
  docs/run-artifact-conventions.md
  docs/track-a/sprint-a1-a2.md
  docs/track-a/sprint-a3-a4.md
  docs/track-a/sprint-a5.md
  docs/track-b/sprint-b1-b2.md
  docs/track-b/sprint-b3-b4.md
  docs/track-b/sprint-b5.md
  docs/track-c/sprint-c1-c2.md
  docs/track-c/sprint-c3-c4.md
  docs/track-c/sprint-c5.md
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
  projects/ops-automation-studio/README.md
  scripts/check_run_artifacts.js
  scripts/check_run_instrumentation.js
  scripts/check_agent_playbook.js
  scripts/check_governance_policy.js
  scripts/check_hitl_audit.js
  scripts/check_governance_registry.js
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
