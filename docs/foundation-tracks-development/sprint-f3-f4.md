# Track F — Sprints F3 & F4

This document summarizes the Track F deliverables implemented for the Control Room UI.

## Sprint F3 — Run detail

Artifacts:
- Run detail panel in `apps/control-room-runs/app/components/RunDetail.tsx`.
- Run event timeline sample data in `apps/control-room-runs/app/data/run-events.json`.
- Run artifact references in `apps/control-room-runs/app/data/run-artifacts.json`.
- Runs dashboard wiring in `apps/control-room-runs/app/components/RunDashboard.tsx`.

Checks:
- `scripts/check_control_room_runs_ui.js` validates run summaries, event data, and artifact references.

## Sprint F4 — Playbook explorer

Artifacts:
- Playbook explorer view in `apps/control-room-runs/app/components/PlaybookExplorer.tsx`.
- Playbook sample data in `apps/control-room-runs/app/data/playbooks.json`.
- Playbook route in `apps/control-room-runs/app/playbooks/page.tsx`.

Checks:
- `scripts/check_control_room_playbooks_ui.js` validates playbook sample data.

## Known limitations

- Data is static sample content until a data source is wired in later Track F sprints.
- Playbook editing and run write-backs remain out of scope (read-only Control Room).
