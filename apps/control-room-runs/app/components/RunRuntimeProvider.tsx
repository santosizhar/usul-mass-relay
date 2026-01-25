"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { approvals as approvalSeed, type ApprovalRequest, type ApprovalStatus } from "../data/approvals";
import { exceptions as exceptionSeed, type ExceptionRequest, type ExceptionStatus } from "../data/exceptions";
import { policies as policySeed, type PolicyEnforcement, type PolicyRecord } from "../data/policies";
import { runSummaries as runSeed, type RunSummary } from "../data/run-summaries";

export type RunRuntimeContextValue = {
  runs: RunSummary[];
  approvals: ApprovalRequest[];
  exceptions: ExceptionRequest[];
  policies: PolicyRecord[];
  updateApproval: (id: string, status: ApprovalStatus, reviewer: string, notes: string) => void;
  updateException: (id: string, status: ExceptionStatus, reviewer: string, notes: string) => void;
  updatePolicyEnforcement: (id: string, enforcement: PolicyEnforcement) => void;
  markPolicyReviewed: (id: string, reviewer: string) => void;
};

const RunRuntimeContext = createContext<RunRuntimeContextValue | undefined>(undefined);

const updateRunStatus = (
  runs: RunSummary[],
  runId: string,
  status: RunSummary["status"]
): RunSummary[] => {
  return runs.map((run) => (run.run_id === runId ? { ...run, status } : run));
};

export const RunRuntimeProvider = ({ children }: { children: ReactNode }) => {
  const [runs, setRuns] = useState<RunSummary[]>(runSeed);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(approvalSeed);
  const [exceptions, setExceptions] = useState<ExceptionRequest[]>(exceptionSeed);
  const [policies, setPolicies] = useState<PolicyRecord[]>(policySeed);

  const updateApproval = useCallback(
    (id: string, status: ApprovalStatus, reviewer: string, notes: string) => {
      setApprovals((prev) =>
        prev.map((item) =>
          item.approval_id === id
            ? {
                ...item,
                status,
                reviewer,
                decision_notes: notes,
                decided_at: new Date().toISOString()
              }
            : item
        )
      );

      const approval = approvals.find((item) => item.approval_id === id);
      if (!approval) {
        return;
      }

      setRuns((prev) => {
        if (status === "approved") {
          return updateRunStatus(prev, approval.run_id, "running");
        }
        if (status === "rejected") {
          return updateRunStatus(prev, approval.run_id, "canceled");
        }
        if (status === "escalated") {
          return updateRunStatus(prev, approval.run_id, "policy_review");
        }
        return prev;
      });
    },
    [approvals]
  );

  const updateException = useCallback(
    (id: string, status: ExceptionStatus, reviewer: string, notes: string) => {
      setExceptions((prev) =>
        prev.map((item) =>
          item.exception_id === id
            ? {
                ...item,
                status,
                reviewer,
                decision_notes: notes,
                decided_at: new Date().toISOString()
              }
            : item
        )
      );

      const exception = exceptions.find((item) => item.exception_id === id);
      if (!exception) {
        return;
      }

      setRuns((prev) => {
        if (status === "approved") {
          return updateRunStatus(prev, exception.run_id, "running");
        }
        if (status === "denied") {
          return updateRunStatus(prev, exception.run_id, "failed");
        }
        if (status === "mitigation-requested") {
          return updateRunStatus(prev, exception.run_id, "awaiting_exception");
        }
        return prev;
      });
    },
    [exceptions]
  );

  const updatePolicyEnforcement = useCallback((id: string, enforcement: PolicyEnforcement) => {
    setPolicies((prev) =>
      prev.map((policy) =>
        policy.policy_id === id
          ? {
              ...policy,
              enforcement,
              review_status: "in-review"
            }
          : policy
      )
    );
  }, []);

  const markPolicyReviewed = useCallback((id: string, reviewer: string) => {
    setPolicies((prev) =>
      prev.map((policy) =>
        policy.policy_id === id
          ? {
              ...policy,
              last_reviewed: new Date().toISOString(),
              last_reviewed_by: reviewer,
              review_status: "stable"
            }
          : policy
      )
    );
  }, []);

  const value = useMemo<RunRuntimeContextValue>(
    () => ({
      runs,
      approvals,
      exceptions,
      policies,
      updateApproval,
      updateException,
      updatePolicyEnforcement,
      markPolicyReviewed
    }),
    [
      approvals,
      exceptions,
      markPolicyReviewed,
      policies,
      runs,
      updateApproval,
      updateException,
      updatePolicyEnforcement
    ]
  );

  return <RunRuntimeContext.Provider value={value}>{children}</RunRuntimeContext.Provider>;
};

export const useRunRuntime = () => {
  const context = useContext(RunRuntimeContext);
  if (!context) {
    throw new Error("useRunRuntime must be used within RunRuntimeProvider");
  }
  return context;
};
