"use client";

import { useMemo, useState } from "react";
import { useRunRuntime } from "./RunRuntimeProvider";
import type { PolicyEnforcement } from "../data/policies";

const formatTimestamp = (value: string) => {
  return new Date(value).toLocaleString("en-US");
};

const statusClassName = (status: string) => {
  switch (status) {
    case "stable":
      return "status-pill status-success";
    case "in-review":
      return "status-pill status-policy";
    case "expiring":
      return "status-pill status-exception";
    default:
      return "status-pill status-awaiting";
  }
};

export const PolicyInspection = () => {
  const { policies, updatePolicyEnforcement, markPolicyReviewed } = useRunRuntime();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    policies[0]?.policy_id ?? ""
  );

  const selectedPolicy = useMemo(() => {
    return policies.find((policy) => policy.policy_id === selectedPolicyId);
  }, [policies, selectedPolicyId]);

  if (!selectedPolicy) {
    return <div className="empty-state">No policies available.</div>;
  }

  return (
    <div className="dashboard-grid">
      <section className="card">
        <div className="list-header">
          <h2>Policy inspection</h2>
          <p className="list-subtitle">Inspect active guardrails and adjust enforcement.</p>
        </div>
        <ul className="list">
          {policies.map((policy) => (
            <li
              key={policy.policy_id}
              className={
                policy.policy_id === selectedPolicyId
                  ? "list-item list-item-selected"
                  : "list-item"
              }
              onClick={() => setSelectedPolicyId(policy.policy_id)}
            >
              <div>
                <p className="list-title">{policy.name}</p>
                <p className="list-meta">
                  {policy.level} · {policy.scope}
                </p>
              </div>
              <span className={statusClassName(policy.review_status)}>
                {policy.review_status}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="detail-card">
        <header className="detail-header">
          <div>
            <p className="detail-eyebrow">Policy detail</p>
            <h2>{selectedPolicy.name}</h2>
            <p className="detail-subtitle">{selectedPolicy.description}</p>
          </div>
          <span className={statusClassName(selectedPolicy.review_status)}>
            {selectedPolicy.review_status}
          </span>
        </header>
        <div className="detail-grid">
          <div>
            <p className="detail-label">Policy ID</p>
            <p className="detail-value">{selectedPolicy.policy_id}</p>
          </div>
          <div>
            <p className="detail-label">Owner</p>
            <p className="detail-value">{selectedPolicy.owner}</p>
          </div>
          <div>
            <p className="detail-label">Level</p>
            <p className="detail-value">{selectedPolicy.level}</p>
          </div>
          <div>
            <p className="detail-label">Scope</p>
            <p className="detail-value">{selectedPolicy.scope}</p>
          </div>
          <div>
            <p className="detail-label">Last reviewed</p>
            <p className="detail-value">{formatTimestamp(selectedPolicy.last_reviewed)}</p>
          </div>
          <div>
            <p className="detail-label">Reviewed by</p>
            <p className="detail-value">{selectedPolicy.last_reviewed_by ?? "—"}</p>
          </div>
        </div>
        <div className="detail-section">
          <h3>Enforcement</h3>
          <div className="policy-controls">
            <label htmlFor="policy-enforcement">Mode</label>
            <select
              id="policy-enforcement"
              value={selectedPolicy.enforcement}
              onChange={(event) =>
                updatePolicyEnforcement(
                  selectedPolicy.policy_id,
                  event.target.value as PolicyEnforcement
                )
              }
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="shadow">Shadow</option>
            </select>
            <button
              className="button button-primary"
              onClick={() => markPolicyReviewed(selectedPolicy.policy_id, "risk.team")}
            >
              Mark reviewed
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
