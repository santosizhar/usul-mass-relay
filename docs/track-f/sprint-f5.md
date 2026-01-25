# Track F — Sprint F5 Review

This document captures the review outcomes for Track F. It consolidates the delivered artifacts,
validates contract alignment, and lists outstanding gaps.

## Reviewed artifacts

- Control Room UI scaffold (`apps/control-room-runs/package.json`, `apps/control-room-runs/next.config.js`,
  `apps/control-room-runs/tsconfig.json`, `apps/control-room-runs/app/layout.tsx`,
  `apps/control-room-runs/app/globals.css`).
- Runs list and dashboard (`apps/control-room-runs/app/components/RunList.tsx`,
  `apps/control-room-runs/app/components/RunDashboard.tsx`).
- Run detail panel (`apps/control-room-runs/app/components/RunDetail.tsx`).
- Playbook explorer (`apps/control-room-runs/app/components/PlaybookExplorer.tsx`,
  `apps/control-room-runs/app/playbooks/page.tsx`).
- UI sample data (`apps/control-room-runs/app/data/run-summaries.json`,
  `apps/control-room-runs/app/data/run-events.json`,
  `apps/control-room-runs/app/data/run-artifacts.json`,
  `apps/control-room-runs/app/data/playbooks.json`).
- UI configuration checks (`scripts/check_control_room_runs_ui.js`,
  `scripts/check_control_room_playbooks_ui.js`).
- Sprint summaries (`docs/track-f/sprint-f1-f2.md`, `docs/track-f/sprint-f3-f4.md`).

## Alignment checks

- Control Room UI remains read-only and references Foundation contracts.
- Run detail views align with Run summary and event schemas.
- Playbook explorer samples align with Agent Playbook contracts.

## Known gaps

- Control Room UI uses static sample data pending Track F runtime wiring.
- Run artifacts are references only; no artifact retrieval pipeline is wired.
- Playbook editing and write-backs remain out of scope for Control Room.

## Next steps

- Introduce live data wiring once Track E storage endpoints are available.
- Implement run exports and artifact retrieval in Track F follow-on work.
- Continue regression coverage in Track G for Control Room UI.
