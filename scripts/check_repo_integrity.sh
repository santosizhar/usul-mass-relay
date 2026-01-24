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
  artifacts/README.md
  artifacts/examples/run.sample.json
  projects/ops-automation-studio/README.md
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
