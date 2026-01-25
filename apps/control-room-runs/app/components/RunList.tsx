"use client";

import { useMemo, useState } from "react";
import runTableConfig from "../../config/run-table.json";
import type { RunSummary } from "../data/run-summaries";

const statusClassName = (status: RunSummary["status"]) => {
  switch (status) {
    case "success":
      return "status-pill status-success";
    case "running":
      return "status-pill status-running";
    case "failed":
      return "status-pill status-failed";
    case "canceled":
      return "status-pill status-canceled";
    case "awaiting_approval":
      return "status-pill status-awaiting";
    case "awaiting_exception":
      return "status-pill status-exception";
    case "policy_review":
      return "status-pill status-policy";
    default:
      return "status-pill";
  }
};

const formatStatusLabel = (status: RunSummary["status"]) => {
  return status.replace(/_/g, " ");
};

type Filters = {
  status: string;
  project: string;
  source: string;
  actor: string;
  purpose: string;
};

const defaultFilters: Filters = {
  status: "",
  project: "",
  source: "",
  actor: "",
  purpose: ""
};

const getUniqueValues = (runs: RunSummary[], key: keyof Filters) => {
  const values = new Set<string>();
  runs.forEach((run) => {
    values.add(String(run[key] ?? ""));
  });
  return Array.from(values).sort();
};

export const RunList = ({
  runs,
  selectedRunId,
  onSelectRun
}: {
  runs: RunSummary[];
  selectedRunId: string;
  onSelectRun: (runId: string) => void;
}) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      return (Object.keys(filters) as (keyof Filters)[]).every((key) => {
        const value = filters[key];
        if (!value) {
          return true;
        }
        return String(run[key]) === value;
      });
    });
  }, [filters, runs]);

  const filterOptions = useMemo(() => {
    return {
      status: getUniqueValues(runs, "status"),
      project: getUniqueValues(runs, "project"),
      source: getUniqueValues(runs, "source"),
      actor: getUniqueValues(runs, "actor"),
      purpose: getUniqueValues(runs, "purpose")
    };
  }, [runs]);

  return (
    <section className="card">
      <div className="filter-grid">
        {runTableConfig.filters.map((filter) => (
          <div key={filter.key}>
            <label htmlFor={`filter-${filter.key}`}>{filter.label}</label>
            <select
              id={`filter-${filter.key}`}
              value={filters[filter.key as keyof Filters]}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  [filter.key]: event.target.value
                }))
              }
            >
              <option value="">All</option>
              {filterOptions[filter.key as keyof Filters].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <table className="table">
        <thead>
          <tr>
            {runTableConfig.columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRuns.map((run) => (
            <tr
              key={run.run_id}
              className={run.run_id === selectedRunId ? "table-row-selected" : undefined}
              onClick={() => onSelectRun(run.run_id)}
            >
              <td>{run.run_id}</td>
              <td>{new Date(run.timestamp).toLocaleString("en-US")}</td>
              <td>
                <span className={statusClassName(run.status)}>
                  {formatStatusLabel(run.status)}
                </span>
              </td>
              <td>{run.project}</td>
              <td>{run.source}</td>
              <td>{run.actor}</td>
              <td>{run.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredRuns.length === 0 && (
        <div className="empty-state">No runs match the selected filters.</div>
      )}
    </section>
  );
};
