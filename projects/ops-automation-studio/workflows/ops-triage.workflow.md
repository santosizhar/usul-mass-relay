# Workflow: Ops intake triage

## Purpose

Establish a consistent triage flow for operational requests that need governance review before
execution.

## Inputs

- Request summary
- Requester identity
- Impacted systems list

## Steps

1. **Collect intake context**
   - Normalize the request summary and impacted systems.
   - Capture any missing information needed for a change plan.
2. **Classify urgency**
   - Draft an urgency level (low/medium/high).
   - Provide routing recommendations and required approvals.
3. **Package for governance review**
   - Emit a triage summary for policy review and escalation.

## Outputs

- Triage summary
- Urgency classification
- Recommended next actions
