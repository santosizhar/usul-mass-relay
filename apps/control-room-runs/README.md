# Control Room Runs UI (Read-only)

This directory now hosts the read-only Control Room surface for Run observability. It is a
Next.js application scaffolded during Track F to render the Runs list, Run detail views, and the
Playbook explorer while preserving the read-only mandate.

## Scope

- Read-only listing of Runs with filters for status, project, source, actor, and purpose.
- Run detail panel with event timeline and artifact references.
- Playbook explorer for Agent Playbooks (read-only).
- Project E Beta modules for cost/quality dashboards, exception visibility, and governance inspection.
- No write-back operations (Control Room remains read-only).

## Beta scope + path to full Project E

The Control Room UI ships as a read-only Beta that aggregates runs across Foundation projects
(not only Ops Automation Studio) while showcasing the core monitoring modules in
`apps/control-room-runs/app/components/ControlRoomModules.tsx`.

**Beta scope**
- Cross-project run aggregation with unified filters.
- Cost/quality dashboard snapshots.
- Exception/failure queue visibility.
- Governance inspection summaries.

**Path to full Project E**
- Live data feeds across all projects and business lanes.
- Interactive exception triage workflows.
- Drill-down governance inspection with approvals.
- Capacity planning and scenario modeling dashboards.

## Data contract

- Run summaries follow `packages/run-instrumentation/src/run-instrumentation.ts`.
- Run summaries include a `project` field for cross-project aggregation.
- Run events follow `packages/run-instrumentation/src/run-events.ts`.
- Playbooks follow `packages/agent-playbook/src/agent-playbook.ts`.
- Table/filter configuration lives in `config/run-table.json`.
- Sample UI data lives in `app/data/*.json`.

## Local development

```bash
cd apps/control-room-runs
npm install
npm run dev
```

The app intentionally uses static sample data until a data source is wired in Track F.
