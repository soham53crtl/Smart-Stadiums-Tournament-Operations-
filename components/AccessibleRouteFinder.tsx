// components/AccessibleRouteFinder.tsx
"use client";

import { useState } from "react";
import { findAccessibleRoute, type LiveState } from "@/lib/mockData";

interface AccessibleRouteFinderProps {
  state: LiveState;
}

export default function AccessibleRouteFinder({ state }: AccessibleRouteFinderProps) {
  const accessibleZones = state.zones.filter((z) => z.wheelchairAccessible);
  const [fromId, setFromId] = useState(accessibleZones[0]?.zoneId ?? "");
  const [toId, setToId] = useState(accessibleZones[1]?.zoneId ?? "");
  const [result, setResult] = useState<string | null>(null);

  function handleFindRoute() {
    const route = findAccessibleRoute(state, fromId, toId);
    if (!route) {
      setResult("No wheelchair-accessible route found between these zones.");
      return;
    }
    const names = route.path.map((id) => state.zones.find((z) => z.zoneId === id)?.name ?? id);
    setResult(`${route.stepCount} stop${route.stepCount === 1 ? "" : "s"}: ${names.join(" → ")}`);
  }

  return (
    <section aria-labelledby="route-finder-heading" className="flex flex-col gap-3">
      <h2 id="route-finder-heading" className="font-display text-lg text-chalk">
        Accessible route finder
      </h2>
      <p className="font-body text-sm text-chalk-muted">
        Computed directly from the accessibility graph — not a model guess.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-data text-xs text-chalk-muted">From</span>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="rounded-md border border-slate bg-panel px-3 py-2 font-body text-sm text-chalk"
          >
            {accessibleZones.map((z) => (
              <option key={z.zoneId} value={z.zoneId}>
                {z.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-data text-xs text-chalk-muted">To</span>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="rounded-md border border-slate bg-panel px-3 py-2 font-body text-sm text-chalk"
          >
            {accessibleZones.map((z) => (
              <option key={z.zoneId} value={z.zoneId}>
                {z.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleFindRoute}
          className="rounded-md bg-signal px-4 py-2 font-display text-sm font-medium text-ink"
        >
          Find route
        </button>
      </div>

      {result && (
        <p role="status" className="rounded-md bg-panel-raised p-3 font-body text-sm text-chalk">
          {result}
        </p>
      )}
    </section>
  );
}
