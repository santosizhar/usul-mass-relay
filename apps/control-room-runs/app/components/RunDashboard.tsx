"use client";

import { useMemo, useState } from "react";
import { RunList } from "./RunList";
import { RunDetail } from "./RunDetail";
import { runEvents } from "../data/run-events";
import { runArtifacts } from "../data/run-artifacts";
import { useRunRuntime } from "./RunRuntimeProvider";

const sortEvents = (events: typeof runEvents) => {
  return [...events].sort((a, b) => {
    const timestampDelta = a.timestamp.localeCompare(b.timestamp);
    if (timestampDelta !== 0) {
      return timestampDelta;
    }
    return a.event_id.localeCompare(b.event_id);
  });
};

export const RunDashboard = () => {
  const { runs, approvals, exceptions, updateApproval, updateException } = useRunRuntime();
  const [selectedRunId, setSelectedRunId] = useState<string>(runs[0]?.run_id ?? "");

  const selectedRun = useMemo(() => {
    return runs.find((run) => run.run_id === selectedRunId);
  }, [runs, selectedRunId]);

  const selectedEvents = useMemo(() => {
    return sortEvents(runEvents.filter((event) => event.run_id === selectedRunId));
  }, [selectedRunId]);

  const selectedArtifacts = useMemo(() => {
    return runArtifacts.find((bundle) => bundle.run_id === selectedRunId);
  }, [selectedRunId]);

  const selectedApprovals = useMemo(() => {
    return approvals.filter((approval) => approval.run_id === selectedRunId);
  }, [approvals, selectedRunId]);

  const selectedExceptions = useMemo(() => {
    return exceptions.filter((exception) => exception.run_id === selectedRunId);
  }, [exceptions, selectedRunId]);

  if (!selectedRun) {
    return <div className="empty-state">No run selected.</div>;
  }

  return (
    <div className="dashboard-grid">
      <RunList runs={runs} selectedRunId={selectedRunId} onSelectRun={setSelectedRunId} />
      <RunDetail
        run={selectedRun}
        events={selectedEvents}
        artifacts={selectedArtifacts}
        approvals={selectedApprovals}
        exceptions={selectedExceptions}
        onApprovalAction={updateApproval}
        onExceptionAction={updateException}
      />
    </div>
  );
};
