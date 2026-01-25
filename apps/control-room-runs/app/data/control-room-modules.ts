export const costQualityDashboards = [
  {
    title: "Cost per run",
    metric: "$12.40",
    detail: "Median across the last 30 runs",
    trend: "down 8% week-over-week"
  },
  {
    title: "Quality signal",
    metric: "92%",
    detail: "Runs passing evaluation gates",
    trend: "stable vs. prior period"
  },
  {
    title: "Release readiness",
    metric: "4/5 lanes",
    detail: "Green on safety + reliability checks",
    trend: "1 lane awaiting policy review"
  }
];

export const exceptionQueue = [
  {
    label: "HITL review rejected",
    summary: "Ops Automation Studio run awaiting supervisor resolution",
    severity: "High"
  },
  {
    label: "Tooling timeout",
    summary: "Reporting Factory run exceeded SLA by 12 minutes",
    severity: "Medium"
  },
  {
    label: "Policy mismatch",
    summary: "Marketing and Docs Factory run blocked on data access scope",
    severity: "Medium"
  }
];

export const governanceChecks = [
  {
    label: "Policy version coverage",
    summary: "All active runs reference approved policy bundles",
    status: "Compliant"
  },
  {
    label: "Audit trail completeness",
    summary: "12/12 sampled runs include trace + evidence links",
    status: "Compliant"
  },
  {
    label: "Write-back safeguards",
    summary: "0 write operations permitted in Control Room",
    status: "Read-only"
  }
];

export const betaScope = [
  "Read-only observability across Foundation runs",
  "Cross-project aggregation with unified filters",
  "Cost/quality, exceptions, and governance snapshots",
  "Planning hooks for future interactivity"
];

export const projectEPath = [
  "Live feeds from all projects and business lanes",
  "Interactive exception triage and remediation workflows",
  "Policy drill-downs with approval routing",
  "Scenario planning + capacity modeling dashboards"
];
