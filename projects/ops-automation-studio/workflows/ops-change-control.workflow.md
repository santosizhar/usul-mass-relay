# Workflow: Ops change control with governed write-backs

## Purpose

Orchestrate a multi-agent, human-in-the-loop change control flow that validates risk,
executes governed write-backs, and records every step in the Run model.

## Inputs

- Change request summary
- Impacted systems inventory
- Risk and compliance requirements
- Pre-approved change window

## Stages

1. **Intake & normalization**
2. **Risk and policy review (HITL)**
3. **Execution plan validation (HITL)**
4. **Governed write-back execution**
5. **Run closure & audit capture**

## Agents

- **Intake Agent**: Normalizes request context, validates required inputs, and opens the Run.
- **Risk Agent**: Evaluates risk posture, compliance requirements, and required approvals.
- **Change Planner Agent**: Drafts execution steps, rollback plan, and evidence collection.
- **Governed Executor Agent**: Executes approved write-backs via governed tools and logs artifacts.
- **Audit Agent**: Finalizes the Run, captures audit summary, and publishes outcomes.

## Steps

1. **Open Run and normalize intake (Agent: Intake Agent)**
   - Generate deterministic Run metadata (run.id, run.stage = "intake").
   - Normalize the change request, impacted systems, and change window.
   - Output normalized intake bundle for downstream agents.
2. **Risk assessment and policy mapping (Agent: Risk Agent)**
   - Evaluate risk tier and map required governance level.
   - Prepare HITL review packet with risk summary and required approvals.
3. **HITL approval: risk & policy review**
   - Human reviewer confirms risk tier, governance level, and scope.
   - Record approval artifact and update run.stage = "risk_review".
4. **Execution plan drafting (Agent: Change Planner Agent)**
   - Draft step-by-step change plan, rollback plan, and monitoring checkpoints.
   - Attach evidence requirements and acceptance criteria.
5. **HITL approval: execution plan**
   - Human reviewer approves the plan, change window, and rollback readiness.
   - Record approval artifact and update run.stage = "plan_approved".
6. **Governed write-back execution (Agent: Governed Executor Agent)**
   - Execute governed tool write-backs using the approved plan.
   - Log every action with run.artifacts and run.trace entries.
   - Update run.stage = "execution" and capture execution telemetry.
7. **Run closure and audit capture (Agent: Audit Agent)**
   - Summarize outcomes, link artifacts, and close run.stage = "closed".
   - Emit audit summary and publish read-only report.

## Run model traceability

- **run.id**: Deterministic ID for every execution instance.
- **run.stage**: intake → risk_review → plan_approved → execution → closed.
- **run.artifacts**: Normalized intake, approvals, execution telemetry, and audit report.
- **run.trace**: Ordered log of tool write-backs and human approvals.

## Outputs

- Normalized intake bundle
- Risk assessment summary with approvals
- Approved execution plan and rollback plan
- Governed write-back execution results
- Run audit summary and Run metadata

## Deterministic sample Runs

See `projects/ops-automation-studio/scenarios/ops-change-control.sample-runs.json` for
concrete, deterministic Run records aligned with this workflow.
