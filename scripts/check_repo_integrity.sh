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
  artifacts/README.md
  artifacts/examples/run.sample.json
  artifacts/examples/run.export.sample.jsonl
  artifacts/examples/run.events.sample.json
  artifacts/examples/run.summary.sample.json
  artifacts/runs/01J8Y3H9ZV3EN8R1B0C1R2D3E4/run.json
  packages/run-model/src/run.ts
  packages/run-model/src/run.schema.json
  packages/run-persistence/src/run-store.ts
  packages/run-persistence/src/run-exporter.ts
  packages/run-instrumentation/README.md
  packages/run-instrumentation/src/run-events.ts
  packages/run-instrumentation/src/run-instrumentation.ts
  projects/ops-automation-studio/README.md
  scripts/check_run_artifacts.js
  scripts/check_run_instrumentation.js
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
