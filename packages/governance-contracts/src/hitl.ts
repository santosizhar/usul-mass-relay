export type HitlStatus = "pending" | "approved" | "rejected" | "expired";

export interface HitlDecision {
  decided_by: string;
  decided_at: string;
  decision: "approved" | "rejected";
  reason: string;
}

export interface HitlRequest {
  request_id: string;
  run_id: string;
  playbook_id: string;
  step_id: string;
  requested_at: string;
  requester: string;
  status: HitlStatus;
  summary: string;
  context_refs: string[];
  decision?: HitlDecision;
}

export interface AuditLogEntry {
  audit_id: string;
  run_id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: "success" | "failure";
  metadata?: Record<string, string>;
}
