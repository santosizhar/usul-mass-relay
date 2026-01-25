import policiesJson from "./policies.json";

export type PolicyEnforcement = "active" | "paused" | "shadow";
export type PolicyReviewStatus = "stable" | "needs-review" | "expiring" | "in-review";

export type PolicyRecord = {
  policy_id: string;
  name: string;
  owner: string;
  level: "A0" | "A1" | "A2" | "A3";
  scope: string;
  description: string;
  enforcement: PolicyEnforcement;
  last_reviewed: string;
  last_reviewed_by?: string;
  review_status: PolicyReviewStatus;
};

export const policies = policiesJson as PolicyRecord[];
