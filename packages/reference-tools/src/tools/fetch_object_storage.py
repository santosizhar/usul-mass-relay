"""Reference tool: fetch object storage asset.

This stub returns a deterministic URI based on the request payload.
"""

from __future__ import annotations

from typing import Any, Dict


def run(request: Dict[str, Any]) -> Dict[str, Any]:
    bucket = request.get("bucket", "unknown")
    key = request.get("key", "")
    return {
        "uri": f"s3://{bucket}/{key}",
        "content_type": "application/octet-stream",
    }
