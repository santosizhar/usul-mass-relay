export type AgentPromptOption = {
  id: string;
  title: string;
  description: string;
  userPrompt: string;
  assistantResponse: string;
  outputTitle: string;
  outputType: string;
  targetPath: string;
  tags: string[];
};

export type AgentSavedDocument = {
  id: string;
  title: string;
  type: string;
  path: string;
  savedAt: string;
  status: string;
  summary: string;
};

export const agentPromptOptions: AgentPromptOption[] = [
  {
    id: "shift-handoff",
    title: "Shift handoff journal",
    description: "Summarize the last 12 hours of Control Room activity for the oncoming lead.",
    userPrompt:
      "Generate a shift handoff journal from the latest Control Room run snapshots, emphasizing open exceptions and governance checks.",
    assistantResponse:
      "## Shift handoff journal\n\n**Coverage window:** 12-hour rotation (07:00 - 19:00 local)\n\n**Run highlights**\n- 18 runs completed, 3 paused for human review, 1 exception escalated.\n- Cost variance improved to -4.2% against baseline after cache tuning.\n\n**Open exceptions**\n- EXT-4021: Inventory sync lag for APAC lane; awaiting upstream data replay.\n- EXT-4017: Policy mismatch on vendor onboarding; legal review queued.\n\n**Governance checks**\n- Policy pack GOV-09 flagged two missing approval artifacts; resubmission requested.\n- Audit trail exports delivered to the compliance archive at 18:45.\n\n**Recommended next actions**\n1. Validate APAC replay completion before 21:00.\n2. Confirm legal review outcome for vendor onboarding before morning stand-up.\n3. Schedule a follow-up cost review for the next sprint checkpoint.",
    outputTitle: "Shift Handoff Journal — 12 Hour Window",
    outputType: "Journal",
    targetPath: "docs/control-room-journals/shift-handoff-journal.md",
    tags: ["handoff", "operations", "exceptions"]
  },
  {
    id: "run-retro",
    title: "Weekly run retrospective",
    description: "Capture weekly learnings and actions from Control Room operations.",
    userPrompt:
      "Draft a weekly run retrospective focused on reliability wins, unresolved risks, and next-week experiments.",
    assistantResponse:
      "## Weekly run retrospective\n\n**Reliability wins**\n- Retry workflow cut run interruptions by 22%.\n- Policy inspection latency reduced from 8m to 3m with the new cache tier.\n\n**Unresolved risks**\n- Two exceptions remain blocked on vendor SLA updates.\n- Automation coverage for compliance sampling is still below the 90% target.\n\n**Next-week experiments**\n- Pilot the auto-routing rule for high-risk exceptions.\n- Expand cost anomaly detection to include supplier lead time variance.\n\n**Support needed**\n- Security review for the new escalation webhook.\n- Product sign-off on audit log retention policy update.",
    outputTitle: "Weekly Control Room Retrospective",
    outputType: "Documentation",
    targetPath: "docs/control-room-journals/weekly-run-retrospective.md",
    tags: ["retrospective", "governance", "reliability"]
  },
  {
    id: "governance-brief",
    title: "Governance briefing",
    description: "Summarize policy inspection outcomes and compliance status.",
    userPrompt:
      "Create a governance briefing from Control Room policy inspection results and recommend follow-up actions.",
    assistantResponse:
      "## Governance briefing\n\n**Policy inspection summary**\n- 14 policies evaluated with 92% overall compliance.\n- Two policies require evidence refresh: GOV-14 and GOV-21.\n\n**Material findings**\n- Missing approval artifact for HITL step 3 in run CR-1189.\n- Elevated risk flags on two automation playbooks due to vendor dependency changes.\n\n**Follow-up actions**\n1. Request updated approval evidence for GOV-14 by end of week.\n2. Re-run playbook risk review for vendor dependency changes.\n3. Confirm audit log exports are included in monthly compliance pack.",
    outputTitle: "Control Room Governance Briefing",
    outputType: "Documentation",
    targetPath: "docs/control-room-journals/governance-briefing.md",
    tags: ["governance", "policy", "compliance"]
  }
];

export const initialSavedDocuments: AgentSavedDocument[] = [
  {
    id: "shift-handoff",
    title: "Shift Handoff Journal — 12 Hour Window",
    type: "Journal",
    path: "docs/control-room-journals/shift-handoff-journal.md",
    savedAt: "2024-08-22T18:45:00Z",
    status: "Saved to repo",
    summary: "Handoff notes covering open exceptions, governance checks, and next actions."
  },
  {
    id: "weekly-retro",
    title: "Weekly Control Room Retrospective",
    type: "Documentation",
    path: "docs/control-room-journals/weekly-run-retrospective.md",
    savedAt: "2024-08-21T17:05:00Z",
    status: "Saved to repo",
    summary: "Weekly reliability wins, unresolved risks, and experiments for next week."
  }
];
