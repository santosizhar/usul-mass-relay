import exceptionsJson from "./exceptions.json";

export type ExceptionStatus = "pending" | "approved" | "denied" | "mitigation-requested";

export type ExceptionRequest = {
  exception_id: string;
  run_id: string;
  policy_id: string;
  requested_by: string;
  requested_at: string;
  severity: "Low" | "Medium" | "High";
  exception_type: string;
  summary: string;
  mitigation_plan: string;
  status: ExceptionStatus;
  reviewer?: string;
  decision_notes?: string;
  decided_at?: string;
};

export const exceptions = exceptionsJson as ExceptionRequest[];
