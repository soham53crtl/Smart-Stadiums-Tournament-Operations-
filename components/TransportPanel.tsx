// components/TransportPanel.tsx
import { getTotalEmissionsSavedKg, type LiveState } from "@/lib/mockData";

interface TransportPanelProps {
  state: LiveState;
}

const MODE_LABEL: Record<string, string> = {
  metro: "Metro",
  bus: "Bus",
  bike_share: "Bike Share",
  park_and_ride: "Park & Ride",
  rideshare_zone: "Rideshare",
};

const STATUS_COLOR: Record<string, string> = {
  on_time: "text-pitch",
  delayed: "text-signal",
  disrupted: "text-signal",
};

export default function TransportPanel({ state }: TransportPanelProps) {
  const totalSaved = getTotalEmissionsSavedKg(state);

  return (
    <section aria-labelledby="transport-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="transport-heading" className="font-display text-lg text-chalk">
          Getting home
        </h2>
        <p className="font-data text-xs text-pitch">
          {totalSaved.toFixed(1)} kg CO₂ saved right now vs. driving alone
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {state.transport.map((t) => (
          <li
            key={t.line}
            className="flex flex-col gap-1 rounded-lg border border-slate bg-panel p-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-chalk">{t.line}</span>
              <span className="font-data text-[10px] uppercase text-chalk-muted">
                {MODE_LABEL[t.mode]}
              </span>
            </div>
            <div className="flex items-center justify-between font-data text-xs">
              <span className={STATUS_COLOR[t.status]}>
                {t.status.replace("_", " ").toUpperCase()} · {t.nextDepartureMinutes}MIN
              </span>
              <span className="text-chalk-muted">{t.estimatedEmissionsSavedKg}kg saved</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}