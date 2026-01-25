# Control Room Runs UI (Read-only)

This directory now hosts the read-only Control Room surface for Run observability. It is a
Next.js application scaffolded during Track F to render the Runs list, Run detail views, and the
Playbook explorer while preserving the read-only mandate.

## Scope

- Read-only listing of Runs with filters for status, source, actor, and purpose.
- Run detail panel with event timeline and artifact references.
- Playbook explorer for Agent Playbooks (read-only).
- No write-back operations (Control Room remains read-only).

## Data contract

- Run summaries follow `packages/run-instrumentation/src/run-instrumentation.ts`.
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
