"use client";

import { useMemo, useState } from "react";
import { RunList } from "./RunList";
import { RunDetail } from "./RunDetail";
import { runSummaries, type RunSummary } from "../data/run-summaries";
import { runEvents } from "../data/run-events";
import { runArtifacts } from "../data/run-artifacts";

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
  const [selectedRunId, setSelectedRunId] = useState<string>(runSummaries[0]?.run_id ?? "");

  const selectedRun = useMemo<RunSummary | undefined>(() => {
    return runSummaries.find((run) => run.run_id === selectedRunId);
  }, [selectedRunId]);

  const selectedEvents = useMemo(() => {
    return sortEvents(runEvents.filter((event) => event.run_id === selectedRunId));
  }, [selectedRunId]);

  const selectedArtifacts = useMemo(() => {
    return runArtifacts.find((bundle) => bundle.run_id === selectedRunId);
  }, [selectedRunId]);

  if (!selectedRun) {
    return <div className="empty-state">No run selected.</div>;
  }

  return (
    <div className="dashboard-grid">
      <RunList
        runs={runSummaries}
        selectedRunId={selectedRunId}
        onSelectRun={setSelectedRunId}
      />
      <RunDetail run={selectedRun} events={selectedEvents} artifacts={selectedArtifacts} />
    </div>
  );
};
