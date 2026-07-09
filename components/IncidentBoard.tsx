// components/IncidentBoard.tsx
"use client";

import { useState } from "react";
import type { IncidentReport, IncidentStatus } from "@/lib/mockData";

interface IncidentBoardProps {
  incidents: IncidentReport[];
}

const STATUS_ORDER: IncidentStatus[] = ["open", "investigating", "resolved"];

const STATUS_COLOR: Record<IncidentStatus, string> = {
  open: "text-signal",
  investigating: "text-chalk",
  resolved: "text-pitch",
};

const SEVERITY_LABEL: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function nextStatus(current: IncidentStatus): IncidentStatus {
  const idx = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
}

export default function IncidentBoard({ incidents: initialIncidents }: IncidentBoardProps) {
  const [incidents, setIncidents] = useState(initialIncidents);

  function advanceStatus(id: string) {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: nextStatus(inc.status) } : inc))
    );
  }

  return (
    <section aria-labelledby="incidents-heading" className="flex flex-col gap-3">
      <h2 id="incidents-heading" className="font-display text-lg text-chalk">
        Incident log
      </h2>
      <ul className="flex flex-col gap-2">
        {incidents.map((inc) => (
          <li
            key={inc.id}
            className="flex flex-col gap-2 rounded-lg border border-slate bg-panel p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <span className="font-body text-sm text-chalk">{inc.description}</span>
              <span className="font-data text-xs text-chalk-muted">
                {inc.zoneId} · {SEVERITY_LABEL[inc.severity]} severity
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-data text-xs uppercase ${STATUS_COLOR[inc.status]}`}>
                {inc.status}
              </span>
              {inc.status !== "resolved" && (
                <button
                  type="button"
                  onClick={() => advanceStatus(inc.id)}
                  className="rounded-md border border-slate px-3 py-1.5 font-body text-xs text-chalk transition-colors hover:border-pitch"
                >
                  Mark as {nextStatus(inc.status)}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
