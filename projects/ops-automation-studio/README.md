# Ops Automation Studio (Project A)

Ops Automation Studio is the reference project that exercises the full Foundation surface,
including governed write-backs and human-in-the-loop (HITL) workflows.

## Scope

- Consume Foundation modules from `packages/`.
- Provide configuration and integration points for governed execution lanes.
- Validate Run-centric observability and artifact storage.

## Planned structure

```
projects/ops-automation-studio/
  README.md
  configs/
  workflows/
  playbooks/
```

## Notes

- The Control Room remains read-only and will consume outputs from this project.
- Implementation details will be added in later sprints.
