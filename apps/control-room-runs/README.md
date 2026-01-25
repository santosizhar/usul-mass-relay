# Control Room Runs UI (HITL enabled)

This directory hosts the Control Room surface for Run observability and human-in-the-loop (HITL)
operations. It is a Next.js application that renders run views, approval and exception queues,
policy inspection, and the playbook explorer.

## Scope

- Read-only listing of Runs with filters for status, project, source, actor, and purpose.
- Run detail panel with event timeline and artifact references.
- Actionable HITL checkpoints for approvals and exception reviews.
- Review queue for approvals, exception queue for guardrail overrides, and policy inspection
  for enforcement adjustments.
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
- Sample UI data lives in `app/data/*.json` and is loaded into an in-memory HITL runtime.

## User flows

### Run oversight

1. Select a run in the Runs table to open the run detail panel.
2. Review event timeline, artifacts, and HITL checkpoints for pending approvals or exceptions.
3. Approve or reject directly from the run detail panel to update run status and queue state.

### Review queue (approvals)

1. Open **Review queue** from the navigation.
2. Select a pending approval to review policy context and risk level.
3. Approve, reject, or escalate to policy review. Decisions update run status.

### Exception queue

1. Open **Exception queue** from the navigation.
2. Review the exception summary, mitigation plan, and run status.
3. Approve, deny, or request mitigation. Actions update the run status and exception state.

### Policy inspection

1. Open **Policy inspection** from the navigation.
2. Select a policy to review scope, enforcement mode, and review status.
3. Adjust enforcement mode or mark the policy reviewed to record governance activity.

## Permissions

- **Run operators**: Can view runs, timelines, and artifacts, and can approve/reject approvals and
  exceptions related to their operational lane.
- **Policy stewards**: Can escalate approvals, update policy enforcement mode, and mark policies
  reviewed.
- **Security/Privacy reviewers**: Can approve or deny exceptions and request mitigation evidence.

The sample UI applies permissions implicitly; wire it to your authz layer to enforce role-based
access in production.

## Local development

```bash
cd apps/control-room-runs
npm install
npm run dev
```

The app intentionally uses static sample data until a data source is wired in Track F.
