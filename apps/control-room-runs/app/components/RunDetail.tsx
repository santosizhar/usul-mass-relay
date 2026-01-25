import type { RunSummary } from "../data/run-summaries";
import type { RunEvent } from "../data/run-events";
import type { RunArtifactBundle } from "../data/run-artifacts";

const eventTypeLabel: Record<RunEvent["type"], string> = {
  start: "Start",
  step: "Step",
  finish: "Finish",
  failure: "Failure"
};

const formatTimestamp = (value: string) => {
  return new Date(value).toLocaleString("en-US");
};

export const RunDetail = ({
  run,
  events,
  artifacts
}: {
  run: RunSummary;
  events: RunEvent[];
  artifacts?: RunArtifactBundle;
}) => {
  const inputArtifacts = artifacts?.inputs ?? [];
  const outputArtifacts = artifacts?.outputs ?? [];

  return (
    <section className="detail-card">
      <header className="detail-header">
        <div>
          <p className="detail-eyebrow">Run detail</p>
          <h2>{run.run_id}</h2>
          <p className="detail-subtitle">{run.purpose}</p>
        </div>
        <span className="detail-status">{run.status}</span>
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
