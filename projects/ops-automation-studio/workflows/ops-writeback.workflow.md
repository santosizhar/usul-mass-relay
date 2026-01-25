# Workflow: Ops governed write-back

## Purpose

Deliver governed write-backs with human approval, Run logging, and audit capture.

## Preconditions

- Approved change plan with governance level A3.
- Validated target systems and change window.
- Run logging enabled for all execution steps.

## Steps

1. **Validate approved plan**
   - Confirm approval artifacts and scope match the execution request.
   - Re-check restricted data handling requirements.
2. **Execute governed tools**
   - Invoke governed execution lane tools through the Python runner.
   - Record Run metadata and artifact references during execution.
3. **Record audit trail**
   - Capture outcomes, timestamps, and approvals in the audit log.
   - Emit a summary for Control Room read-only consumption.

## Outputs

- Write-back execution result
- Run identifier and artifacts
- Audit summary record
