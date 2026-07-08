// components/LiveRibbon.tsx
// The signature visual element: a horizontal ticker styled after stadium
// concourse departure boards, showing live zone/transport state. Shared
// across all four role views so the "live state" driving the AI feels real
// and consistent, not just decoration.

import type { LiveState } from "@/lib/mockData";

interface LiveRibbonProps {
  state: LiveState;
}

export default function LiveRibbon({ state }: LiveRibbonProps) {
  const items = [
    ...state.zones.map(
      (z) => `${z.name.toUpperCase()} · ${z.capacityPercent}% CAP · ${z.queueWaitMinutes}MIN WAIT`
    ),
    ...state.transport.map(
      (t) =>
        `${t.line.toUpperCase()} · ${t.status.replace("_", " ").toUpperCase()} · NEXT ${t.nextDepartureMinutes}MIN`
    ),
    `WEATHER · ${state.weather.condition.toUpperCase()} ${state.weather.tempCelsius}°C`,
  ];

  // Duplicate the list so the CSS animation can loop seamlessly at -50%.
  const doubled = [...items, ...items];

  return (
    <div
      role="status"
      aria-label="Live stadium status ticker"
      className="w-full overflow-hidden border-y border-slate bg-panel py-2"
    >
      <div className="flex w-max animate-ticker gap-10 whitespace-nowrap font-data text-xs text-pitch">
        {doubled.map((text, i) => (
          <span key={i} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-signal">
              ●
            </span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
