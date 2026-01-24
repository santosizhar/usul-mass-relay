# Python Runner Contract

This package defines the governed Python execution lane request/response contracts and provides a
reference runner stub. The runner is not a control-plane component; it executes within the
governed execution lane.

## Contents

- `src/python-runner.ts`: TypeScript interfaces for runner requests and responses.
- `src/python-runner.request.schema.json`: JSON schema for runner request payloads.
- `src/python-runner.response.schema.json`: JSON schema for runner response payloads.
- `src/runner.py`: Reference Python runner stub for deterministic execution.

## Usage notes

- Requests must include Run and trace identifiers provided by the control plane.
- Responses must include start/finish timestamps for deterministic auditing.
- The stub implementation is illustrative and does not perform real I/O.
