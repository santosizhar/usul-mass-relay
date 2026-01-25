"use client";

import { useMemo, useState } from "react";
import { playbooks, type AgentPlaybook } from "../data/playbooks";

const formatTimestamp = (value: string) => {
  return new Date(value).toLocaleString("en-US");
};

const PlaybookDetail = ({ playbook }: { playbook: AgentPlaybook }) => {
  return (
    <section className="detail-card">
      <header className="detail-header">
        <div>
          <p className="detail-eyebrow">Playbook detail</p>
          <h2>{playbook.name}</h2>
          <p className="detail-subtitle">{playbook.description}</p>
        </div>
        <span className="detail-status">v{playbook.version}</span>
      </header>

      <div className="detail-grid">
        <div>
          <p className="detail-label">Owner</p>
          <p className="detail-value">{playbook.owner}</p>
        </div>
        <div>
          <p className="detail-label">Lane</p>
          <p className="detail-value">{playbook.runtime.lane}</p>
        </div>
        <div>
          <p className="detail-label">Entrypoint</p>
          <p className="detail-value">{playbook.runtime.entrypoint}</p>
        </div>
        <div>
          <p className="detail-label">Governance</p>
          <p className="detail-value">
            {playbook.governance.level} · {playbook.governance.policy_id}
          </p>
        </div>
        <div>
          <p className="detail-label">Created</p>
          <p className="detail-value">{formatTimestamp(playbook.created_at)}</p>
        </div>
        <div>
          <p className="detail-label">Updated</p>
          <p className="detail-value">{formatTimestamp(playbook.updated_at)}</p>
        </div>
      </div>

      <div className="detail-section">
        <h3>Steps</h3>
        <ul className="timeline">
          {playbook.steps.map((step) => (
            <li key={step.step_id}>
              <div className="timeline-header">
                <span className="timeline-type">{step.name}</span>
                {step.requires_human_approval && (
                  <span className="timeline-flag">HITL</span>
                )}
              </div>
              <p>{step.purpose}</p>
              <p className="timeline-meta">
                Action: {step.action} · Inputs: {step.inputs.join(", ") || "None"} · Outputs: {step.outputs.join(", ") || "None"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const PlaybookExplorer = () => {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(
    playbooks[0]?.playbook_id ?? ""
  );

  const selectedPlaybook = useMemo(() => {
    return playbooks.find((playbook) => playbook.playbook_id === selectedPlaybookId);
  }, [selectedPlaybookId]);

  if (!selectedPlaybook) {
    return <div className="empty-state">No playbook selected.</div>;
  }

  return (
    <div className="dashboard-grid">
      <section className="card">
        <div className="list-header">
          <h2>Playbooks</h2>
          <p className="list-subtitle">Read-only explorer of Agent Playbooks.</p>
        </div>
        <ul className="list">
          {playbooks.map((playbook) => (
            <li
              key={playbook.playbook_id}
              className={
                playbook.playbook_id === selectedPlaybookId
                  ? "list-item list-item-selected"
                  : "list-item"
              }
              onClick={() => setSelectedPlaybookId(playbook.playbook_id)}
            >
              <div>
                <p className="list-title">{playbook.name}</p>
                <p className="list-meta">
                  {playbook.runtime.lane} · {playbook.governance.level}
                </p>
              </div>
              <span className="list-version">v{playbook.version}</span>
            </li>
          ))}
        </ul>
      </section>
      <PlaybookDetail playbook={selectedPlaybook} />
    </div>
  );
};
