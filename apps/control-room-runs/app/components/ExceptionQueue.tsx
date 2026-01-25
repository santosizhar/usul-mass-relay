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
    case "denied":
      return "status-pill status-failed";
    case "mitigation-requested":
      return "status-pill status-awaiting";
    default:
      return "status-pill status-exception";
  }
};

export const ExceptionQueue = () => {
  const { exceptions, runs, updateException } = useRunRuntime();
  const [selectedExceptionId, setSelectedExceptionId] = useState<string>(
    exceptions[0]?.exception_id ?? ""
  );

  const selectedException = useMemo(() => {
    return exceptions.find((item) => item.exception_id === selectedExceptionId);
  }, [exceptions, selectedExceptionId]);

  const selectedRun = useMemo(() => {
    if (!selectedException) {
      return undefined;
    }
    return runs.find((run) => run.run_id === selectedException.run_id);
  }, [runs, selectedException]);

  if (!selectedException) {
    return <div className="empty-state">No exceptions in the queue.</div>;
  }

  return (
    <div className="dashboard-grid">
      <section className="card">
        <div className="list-header">
          <h2>Exception queue</h2>
          <p className="list-subtitle">Review requests to override policy guardrails.</p>
        </div>
        <ul className="list">
          {exceptions.map((exception) => (
            <li
              key={exception.exception_id}
              className={
                exception.exception_id === selectedExceptionId
                  ? "list-item list-item-selected"
                  : "list-item"
              }
              onClick={() => setSelectedExceptionId(exception.exception_id)}
            >
              <div>
                <p className="list-title">{exception.exception_type}</p>
                <p className="list-meta">
                  {exception.run_id} · {exception.policy_id}
                </p>
              </div>
              <span className={statusClassName(exception.status)}>{exception.status}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="detail-card">
        <header className="detail-header">
          <div>
            <p className="detail-eyebrow">Exception detail</p>
            <h2>{selectedException.exception_type}</h2>
            <p className="detail-subtitle">{selectedException.summary}</p>
          </div>
          <span className={statusClassName(selectedException.status)}>
            {selectedException.status}
          </span>
        </header>
        <div className="detail-grid">
          <div>
            <p className="detail-label">Run</p>
            <p className="detail-value">{selectedException.run_id}</p>
          </div>
          <div>
            <p className="detail-label">Policy</p>
            <p className="detail-value">{selectedException.policy_id}</p>
          </div>
          <div>
            <p className="detail-label">Severity</p>
            <p className="detail-value">{selectedException.severity}</p>
          </div>
          <div>
            <p className="detail-label">Requested by</p>
            <p className="detail-value">{selectedException.requested_by}</p>
          </div>
          <div>
            <p className="detail-label">Requested at</p>
            <p className="detail-value">{formatTimestamp(selectedException.requested_at)}</p>
          </div>
          {selectedRun && (
            <div>
              <p className="detail-label">Run status</p>
              <p className="detail-value">{selectedRun.status}</p>
            </div>
          )}
        </div>
        <div className="detail-section">
          <h3>Mitigation plan</h3>
          <p className="detail-note">{selectedException.mitigation_plan}</p>
        </div>
        <div className="detail-section">
          <h3>Decision</h3>
          <div className="action-row">
            <button
              className="button button-primary"
              onClick={() =>
                updateException(
                  selectedException.exception_id,
                  "approved",
                  "control.room",
                  "Exception approved with timeboxed controls"
                )
              }
            >
              Approve
            </button>
            <button
              className="button button-secondary"
              onClick={() =>
                updateException(
                  selectedException.exception_id,
                  "denied",
                  "control.room",
                  "Exception denied; use standard path"
                )
              }
            >
              Deny
            </button>
            <button
              className="button button-tertiary"
              onClick={() =>
                updateException(
                  selectedException.exception_id,
                  "mitigation-requested",
                  "control.room",
                  "Request additional mitigation steps"
                )
              }
            >
              Request mitigation
            </button>
          </div>
          {selectedException.decision_notes && (
            <p className="detail-note">{selectedException.decision_notes}</p>
          )}
        </div>
      </section>
    </div>
  );
};
