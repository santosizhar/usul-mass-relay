"""Reference governed execution lane runner stub.

This runner is illustrative only and does not perform real I/O. It accepts a
PythonRunnerRequest payload and returns a deterministic PythonRunnerResponse.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict


@dataclass
class RunnerResult:
    status: str
    output: Dict[str, Any]
    error: Dict[str, str] | None = None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def execute_tool(request: Dict[str, Any]) -> RunnerResult:
    tool_id = request.get("tool_id", "unknown")
    payload = request.get("input", {})
    return RunnerResult(
        status="success",
        output={
            "tool_id": tool_id,
            "echo": payload,
        },
    )


def run_request(request: Dict[str, Any]) -> Dict[str, Any]:
    started_at = _now_iso()
    result = execute_tool(request)
    finished_at = _now_iso()

    response = {
        "request_id": request.get("request_id"),
        "run_id": request.get("run_id"),
        "tool_id": request.get("tool_id"),
        "tool_version": request.get("tool_version"),
        "status": result.status,
        "started_at": started_at,
        "finished_at": finished_at,
        "output": result.output,
        "trace": request.get("trace", {}),
    }

    if result.error:
        response["error"] = result.error

    return response
