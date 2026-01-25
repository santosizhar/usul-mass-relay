# Step 1 — Problem Modelling, System Architecture & Data Modelling (FINAL)

## Core Problem Statement

Mass Relay makes AI systems operable as durable infrastructure rather than fragile projects, primarily addressing:
- Poor reuse across AI projects.
- Inability to operationalize AI beyond pilots.

## Users & Workflows (Primary Personas)

- Ops/Product Manager (Operator): configures workflows/agents, runs & monitors, uses review and exception flows.
- AI Platform/Infra Engineer: builds Foundation modules, owns governance, evaluation, observability, and blast radius controls.

## System Boundaries

In scope (Foundation):
- Identity/permissions/policy enforcement
- Connector/ingestion framework
- Canonical data model
- Workflow orchestration & agent runtime
- Agent Playbooks & LLM gateway
- Knowledge layer
- Observability/evaluation/release gates
- Operational UI/UX patterns

Out of scope:
- Project-specific ingestion logic
- Ungoverned direct external access/actions

## Determinism & Governance Strategy (Locked for Planning)

- Outputs are probabilistic with bounded variance, controlled via versioning/diffs, evaluation, validation/redaction hooks, and gates.

## UI Priority (Locked)

- Balanced between operator/admin UX and configuration/authoring UX.

## Co-developed Project Criterion

- Select a single project to stress as many Foundation modules as possible without bespoke exceptions.
