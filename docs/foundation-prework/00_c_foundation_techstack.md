# Foundation Platform Stack

This document defines platform stack categories without locking implementation choices.

---

## Frontend

- Operational user interfaces and admin consoles.
- Supports review workflows, trace visualization, and configuration.
- Designed for complex state and observability views.

---

## Backend / Control Plane

- Orchestration, agent runtime, and policy enforcement.
- Central authority for execution and governance.
- Exposes APIs for all project functionality.

---

## Data and Storage

- Stores canonical objects, configurations, and audit logs.
- Supports both transactional and analytical access.
- Handles artifacts and derived outputs.

---

## Knowledge and Retrieval

- Indexing and retrieval abstraction layer.
- Supports embeddings and search strategies.
- Decoupled from storage implementation.

---

## Async and Execution

- Background jobs, schedules, and retries.
- Long-running workflow support.
- Required for reliable automation.

---

## Observability and Evaluation

- Traces, metrics, logs, and evaluation outputs.
- Feeds dashboards and release gates.
- Enables quality and cost control.
