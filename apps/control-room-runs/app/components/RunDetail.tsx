"use client";

import type { RunSummary } from "../data/run-summaries";
import type { RunEvent } from "../data/run-events";
import type { RunArtifactBundle } from "../data/run-artifacts";
import type { ApprovalRequest, ApprovalStatus } from "../data/approvals";
import type { ExceptionRequest, ExceptionStatus } from "../data/exceptions";

const eventTypeLabel: Record<RunEvent["type"], string> = {
  start: "Start",
  step: "Step",
  finish: "Finish",
  failure: "Failure"
};

const formatTimestamp = (value: string) => {
  return new Date(value).toLocaleString("en-US");
};

const runStatusClassName = (status: RunSummary["status"]) => {
  switch (status) {
    case "success":
      return "status-success";
    case "running":
      return "status-running";
    case "failed":
      return "status-failed";
    case "canceled":
      return "status-canceled";
    case "awaiting_approval":
      return "status-awaiting";
    case "awaiting_exception":
      return "status-exception";
    case "policy_review":
      return "status-policy";
    default:
      return "";
  }
};

const formatStatusLabel = (status: RunSummary["status"]) => {
  return status.replace(/_/g, " ");
};

export const RunDetail = ({
  run,
  events,
  artifacts,
  approvals,
  exceptions,
  onApprovalAction,
  onExceptionAction
}: {
  run: RunSummary;
  events: RunEvent[];
  artifacts?: RunArtifactBundle;
  approvals: ApprovalRequest[];
  exceptions: ExceptionRequest[];
  onApprovalAction: (id: string, status: ApprovalStatus, reviewer: string, notes: string) => void;
  onExceptionAction: (
    id: string,
    status: ExceptionStatus,
    reviewer: string,
    notes: string
  ) => void;
}) => {
  const inputArtifacts = artifacts?.inputs ?? [];
  const outputArtifacts = artifacts?.outputs ?? [];
  const pendingApprovals = approvals.filter((approval) => approval.status === "pending");
  const pendingExceptions = exceptions.filter((exception) => exception.status === "pending");

  return (
    <section className="detail-card">
      <header className="detail-header">
        <div>
          <p className="detail-eyebrow">Run detail</p>
          <h2>{run.run_id}</h2>
          <p className="detail-subtitle">{run.purpose}</p>
        </div>
        <span className={`detail-status status-pill ${runStatusClassName(run.status)}`}>
          {formatStatusLabel(run.status)}
        </span>
      </header>

      <div className="detail-grid">
        <div>
          <p className="detail-label">Timestamp</p>
          <p className="detail-value">{formatTimestamp(run.timestamp)}</p>
        </div>
        <div>
          <p className="detail-label">Source</p>
          <p className="detail-value">{run.source}</p>
        </div>
        <div>
          <p className="detail-label">Actor</p>
          <p className="detail-value">{run.actor}</p>
        </div>
        <div>
          <p className="detail-label">Trace ID</p>
          <p className="detail-value">{run.trace_id}</p>
        </div>
      </div>

      <div className="detail-section">
        <h3>Event timeline</h3>
        <ul className="timeline">
          {events.map((event) => (
            <li key={event.event_id}>
              <div className="timeline-header">
                <span className="timeline-type">{eventTypeLabel[event.type]}</span>
                <span className="timeline-time">{formatTimestamp(event.timestamp)}</span>
              </div>
              <p>{event.message}</p>
              {event.metadata && (
                <div className="timeline-meta">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <span key={key}>
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
          {events.length === 0 && (
            <li className="empty-state">No events recorded for this run.</li>
          )}
        </ul>
      </div>

      {(pendingApprovals.length > 0 || pendingExceptions.length > 0) && (
        <div className="detail-section">
          <h3>HITL checkpoints</h3>
          <div className="checkpoint-grid">
            {pendingApprovals.map((approval) => (
              <div key={approval.approval_id} className="checkpoint-card">
                <div>
                  <p className="checkpoint-title">Approval: {approval.step_name}</p>
                  <p className="checkpoint-meta">
                    {approval.policy_id} · Risk {approval.risk}
                  </p>
                  <p className="checkpoint-summary">{approval.summary}</p>
                </div>
                <div className="checkpoint-actions">
                  <button
                    className="button button-primary"
                    onClick={() =>
                      onApprovalAction(
                        approval.approval_id,
                        "approved",
                        "control.room",
                        "Approved from run detail"
                      )
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() =>
                      onApprovalAction(
                        approval.approval_id,
                        "rejected",
                        "control.room",
                        "Rejected from run detail"
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingExceptions.map((exception) => (
              <div key={exception.exception_id} className="checkpoint-card">
                <div>
                  <p className="checkpoint-title">Exception: {exception.exception_type}</p>
                  <p className="checkpoint-meta">
                    {exception.policy_id} · Severity {exception.severity}
                  </p>
                  <p className="checkpoint-summary">{exception.summary}</p>
                </div>
                <div className="checkpoint-actions">
                  <button
                    className="button button-primary"
                    onClick={() =>
                      onExceptionAction(
                        exception.exception_id,
                        "approved",
                        "control.room",
                        "Exception approved"
                      )
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() =>
                      onExceptionAction(
                        exception.exception_id,
                        "denied",
                        "control.room",
                        "Exception denied"
                      )
                    }
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="detail-section">
        <h3>Artifacts</h3>
        <div className="artifact-grid">
          <div>
            <h4>Inputs</h4>
            <ul>
              {inputArtifacts.map((item) => (
                <li key={item.path}>
                  <span className="artifact-label">{item.label}</span>
                  <span className="artifact-path">{item.path}</span>
                </li>
              ))}
              {inputArtifacts.length === 0 && (
                <li className="empty-state">No inputs recorded.</li>
              )}
            </ul>
          </div>
          <div>
            <h4>Outputs</h4>
            <ul>
              {outputArtifacts.map((item) => (
                <li key={item.path}>
                  <span className="artifact-label">{item.label}</span>
                  <span className="artifact-path">{item.path}</span>
                </li>
              ))}
              {outputArtifacts.length === 0 && (
                <li className="empty-state">No outputs recorded.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
