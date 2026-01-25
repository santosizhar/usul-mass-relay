"""Reference tool: record run summary.

This stub echoes the summary payload for auditing tests.
"""

from __future__ import annotations

from typing import Any, Dict


def run(request: Dict[str, Any]) -> Dict[str, Any]:
    summary = request.get("summary", {})
    return {
        "recorded": True,
        "summary": summary,
    }
