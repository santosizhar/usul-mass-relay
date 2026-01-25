import {
  betaScope,
  costQualityDashboards,
  exceptionQueue,
  governanceChecks,
  projectEPath
} from "../data/control-room-modules";

export const ControlRoomModules = () => {
  return (
    <section className="module-stack">
      <div className="module-header">
        <div>
          <p className="detail-eyebrow">Factory Control Room (Project E Beta)</p>
          <h2 className="module-title">Operational dashboards & governance visibility</h2>
          <p className="module-subtitle">
            Consolidated read-only snapshots for cost, quality, exception handling, and policy
            inspection across Foundation projects.
          </p>
        </div>
        <span className="app-badge">Beta scope</span>
      </div>

      <div className="module-grid">
        <article className="card module-card">
          <h3>Cost &amp; quality dashboards</h3>
          <ul className="module-list">
            {costQualityDashboards.map((item) => (
              <li key={item.title}>
                <div className="module-metric">
                  <span className="module-metric-value">{item.metric}</span>
                  <span className="module-metric-title">{item.title}</span>
                </div>
                <p className="module-detail">{item.detail}</p>
                <p className="module-trend">{item.trend}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="card module-card">
          <h3>Exception &amp; failure visibility</h3>
          <ul className="module-list">
            {exceptionQueue.map((item) => (
              <li key={item.label}>
                <div className="module-row">
                  <span className="module-pill">{item.severity}</span>
                  <span className="module-row-title">{item.label}</span>
                </div>
                <p className="module-detail">{item.summary}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="card module-card">
          <h3>Governance inspection</h3>
          <ul className="module-list">
            {governanceChecks.map((item) => (
              <li key={item.label}>
                <div className="module-row">
                  <span className="module-pill module-pill-secondary">{item.status}</span>
                  <span className="module-row-title">{item.label}</span>
                </div>
                <p className="module-detail">{item.summary}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="module-grid">
        <article className="card module-card">
          <h3>Beta scope commitments</h3>
          <ul className="module-bullets">
            {betaScope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="card module-card">
          <h3>Path to full Project E</h3>
          <ul className="module-bullets">
            {projectEPath.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};
