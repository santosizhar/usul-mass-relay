import approvalsJson from "./approvals.json";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";

export type ApprovalRequest = {
  approval_id: string;
  run_id: string;
  policy_id: string;
  step_name: string;
  requested_by: string;
  requested_at: string;
  risk: "Low" | "Medium" | "High";
  summary: string;
  status: ApprovalStatus;
  reviewer?: string;
  decision_notes?: string;
  decided_at?: string;
};

export const approvals = approvalsJson as ApprovalRequest[];
