# Track F — Sprints F1 & F2

This document summarizes the Track F deliverables implemented for the Control Room UI.

## Sprint F1 — App scaffold

Artifacts:
- Next.js app scaffold in `apps/control-room-runs`.
- Layout, global styles, and read-only shell layout in `apps/control-room-runs/app`.

Checks:
- `scripts/check_control_room_runs_ui.js` validates the UI configuration and sample data alignment.

## Sprint F2 — Runs list

Artifacts:
- Runs list and filter UI in `apps/control-room-runs/app/components/RunList.tsx`.
- Sample run summaries in `apps/control-room-runs/app/data/run-summaries.json`.
- Run table/filter configuration reused from `apps/control-room-runs/config/run-table.json`.

## Known limitations

- Data is static sample content until a data source is wired in later Track F sprints.
- Run detail and artifact panels remain deferred to Sprint F3.
