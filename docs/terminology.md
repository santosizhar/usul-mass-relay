# Terminology

This document defines canonical terminology for Mass Relay. Terms are intentionally precise and
should be treated as contracts.

## Core terms

- **Prompt Pack**: The Chat-level artifacts MP1, MP2, and MP3. No other documents qualify.
- **Agent Playbook**: The runtime behavior unit for AI systems. Playbooks are versioned and
  traceable.
- **Governance policy**: The policy ladder (A0–A3) that defines allowed actions, review gates,
  and logging requirements for governed execution.
- **Foundation**: Shared, normalized platform capabilities built once and reused by Projects.
- **Project**: A domain-specific configuration built on top of Foundation modules.
- **Control Room (Beta)**: Read-only operational surface consuming Foundation artifacts.
- **Run**: Atomic unit of observability, cost, quality, and traceability. Every operation emits a Run.

## Supporting terms

- **Control plane**: TypeScript + Node execution lane for governance and orchestration.
- **Governed execution lane**: Python tooling lane used only for schema-governed actions.
- **Track**: A Foundation module defined in the roadmap with five sprints.
