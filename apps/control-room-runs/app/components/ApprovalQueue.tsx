"use client";

import { useMemo, useState } from "react";
import { useRunRuntime } from "./RunRuntimeProvider";

const formatTimestamp = (value: string) => {
  return new Date(value).toLocaleString("en-US");
};

const statusClassName = (status: string) => {
  switch (status) {
    case "approved":
      return "status-pill status-success";
    case "rejected":
      return "status-pill status-failed";
    case "escalated":
      return "status-pill status-policy";
    default:
      return "status-pill status-awaiting";
  }
};

export const ApprovalQueue = () => {
  const { approvals, runs, updateApproval } = useRunRuntime();
  const [selectedApprovalId, setSelectedApprovalId] = useState<string>(
    approvals[0]?.approval_id ?? ""
  );

  const selectedApproval = useMemo(() => {
    return approvals.find((item) => item.approval_id === selectedApprovalId);
  }, [approvals, selectedApprovalId]);

  const selectedRun = useMemo(() => {
    if (!selectedApproval) {
      return undefined;
    }
    return runs.find((run) => run.run_id === selectedApproval.run_id);
  }, [runs, selectedApproval]);

  if (!selectedApproval) {
    return <div className="empty-state">No approvals in the queue.</div>;
  }

  return (
    <div className="dashboard-grid">
      <section className="card">
        <div className="list-header">
          <h2>Review queue</h2>
          <p className="list-subtitle">Approve, reject, or escalate human review gates.</p>
        </div>
        <ul className="list">
          {approvals.map((approval) => (
            <li
              key={approval.approval_id}
              className={
                approval.approval_id === selectedApprovalId
                  ? "list-item list-item-selected"
                  : "list-item"
              }
              onClick={() => setSelectedApprovalId(approval.approval_id)}
            >
              <div>
                <p className="list-title">{approval.step_name}</p>
                <p className="list-meta">
                  {approval.run_id} · {approval.policy_id}
                </p>
              </div>
              <span className={statusClassName(approval.status)}>{approval.status}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="detail-card">
        <header className="detail-header">
          <div>
            <p className="detail-eyebrow">Approval detail</p>
            <h2>{selectedApproval.step_name}</h2>
            <p className="detail-subtitle">{selectedApproval.summary}</p>
          </div>
          <span className={statusClassName(selectedApproval.status)}>
            {selectedApproval.status}
          </span>
        </header>
        <div className="detail-grid">
          <div>
            <p className="detail-label">Run</p>
            <p className="detail-value">{selectedApproval.run_id}</p>
          </div>
          <div>
            <p className="detail-label">Policy</p>
            <p className="detail-value">{selectedApproval.policy_id}</p>
          </div>
          <div>
            <p className="detail-label">Risk</p>
            <p className="detail-value">{selectedApproval.risk}</p>
          </div>
          <div>
            <p className="detail-label">Requested by</p>
            <p className="detail-value">{selectedApproval.requested_by}</p>
          </div>
          <div>
            <p className="detail-label">Requested at</p>
            <p className="detail-value">{formatTimestamp(selectedApproval.requested_at)}</p>
          </div>
          {selectedRun && (
            <div>
              <p className="detail-label">Run status</p>
              <p className="detail-value">{selectedRun.status}</p>
            </div>
          )}
        </div>
        <div className="detail-section">
          <h3>Decision</h3>
          <div className="action-row">
            <button
              className="button button-primary"
              onClick={() =>
                updateApproval(
                  selectedApproval.approval_id,
                  "approved",
                  "control.room",
                  "Approved with operational guardrails"
                )
              }
            >
              Approve
            </button>
            <button
              className="button button-secondary"
              onClick={() =>
                updateApproval(
                  selectedApproval.approval_id,
                  "rejected",
                  "control.room",
                  "Rejected due to unmet safeguards"
                )
              }
            >
              Reject
            </button>
            <button
              className="button button-tertiary"
              onClick={() =>
                updateApproval(
                  selectedApproval.approval_id,
                  "escalated",
                  "control.room",
                  "Escalated to policy council"
                )
              }
            >
              Escalate
            </button>
          </div>
          {selectedApproval.decision_notes && (
            <p className="detail-note">{selectedApproval.decision_notes}</p>
          )}
        </div>
      </section>
    </div>
  );
};
