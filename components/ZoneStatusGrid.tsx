// components/ZoneStatusGrid.tsx
// Renders the per-zone capacity cards with trend indicators. Extracted out
// of the Ops page so that page file is responsible for composing sections,
// not for the markup details of any one section.

import type { ZoneStatus } from "@/lib/mockData";
import { getCapacityTrend, CAPACITY_ANOMALY_THRESHOLD } from "@/lib/mockData";

interface ZoneStatusGridProps {
  zones: ZoneStatus[];
}

const TREND_ARROW: Record<string, string> = {
  rising: "↑",
  falling: "↓",
  stable: "→",
};

export default function ZoneStatusGrid({ zones }: ZoneStatusGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {zones.map((zone) => {
        const trend = getCapacityTrend(zone);
        const isOverThreshold = zone.capacityPercent >= CAPACITY_ANOMALY_THRESHOLD;

        return (
          <div
            key={zone.zoneId}
            className="flex flex-col gap-2 rounded-lg border border-slate bg-panel p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-chalk">{zone.name}</span>
              <span
                className={`flex items-center gap-1 font-data text-xs ${
                  isOverThreshold ? "text-signal" : "text-pitch"
                }`}
              >
                {zone.capacityPercent}%<span aria-hidden="true">{TREND_ARROW[trend]}</span>
                <span className="sr-only">{trend}</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-raised">
              <div
                className={`h-full rounded-full ${isOverThreshold ? "bg-signal" : "bg-pitch"}`}
                style={{ width: `${zone.capacityPercent}%` }}
              />
            </div>
            <span className="font-data text-xs text-chalk-muted">
              {zone.queueWaitMinutes} min wait · trend {trend}
            </span>
          </div>
        );
      })}
    </div>
  );
}
