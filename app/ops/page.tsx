// app/ops/page.tsx
import RoleSwitcher from "@/components/RoleSwitcher";
import LiveRibbon from "@/components/LiveRibbon";
import ChatInterface from "@/components/ChatInterface";
import TransportPanel from "@/components/TransportPanel";
import IncidentBoard from "@/components/IncidentBoard";
import {
  detectCapacityAnomalies,
  getCapacityTrend,
  getLiveState,
  rankZonesByUrgency,
} from "@/lib/mockData";

const TREND_ARROW: Record<string, string> = {
  rising: "↑",
  falling: "↓",
  stable: "→",
};

const TREND_LABEL: Record<string, string> = {
  rising: "rising",
  falling: "falling",
  stable: "stable",
};

export default function OpsPage() {
  const state = getLiveState();
  const anomalies = detectCapacityAnomalies(state);
  const rankedZones = rankZonesByUrgency(state);

  return (
    <>
      <RoleSwitcher />
      <LiveRibbon state={state} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="font-data text-xs tracking-widest text-signal">OPS MODE</p>
          <h1 className="font-display text-3xl text-chalk">Zone status</h1>
          <p className="font-body text-sm text-chalk-muted">
            Ranked by urgency — capacity and short-term trend combined, computed
            from the last 6 readings per zone.
          </p>
        </div>

        {anomalies.length > 0 && (
          <div
            role="alert"
            className="flex flex-col gap-1 rounded-lg border border-signal-dim bg-signal-dim/20 p-4"
          >
            <span className="font-data text-xs uppercase tracking-widest text-signal">
              System-flagged anomaly
            </span>
            <span className="font-body text-sm text-chalk">
              {anomalies.length === 1
                ? `${anomalies[0].name} is at ${anomalies[0].capacityPercent}% capacity, above the 85% threshold.`
                : `${anomalies.length} zones are above the 85% capacity threshold: ${anomalies
                    .map((a) => `${a.name} (${a.capacityPercent}%)`)
                    .join(", ")}.`}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rankedZones.map((zone) => {
            const trend = getCapacityTrend(zone);
            return (
              <div
                key={zone.zoneId}
                className="flex flex-col gap-2 rounded-lg border border-slate bg-panel p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-chalk">{zone.name}</span>
                  <span
                    className={`flex items-center gap-1 font-data text-xs ${
                      zone.capacityPercent >= 85 ? "text-signal" : "text-pitch"
                    }`}
                  >
                    {zone.capacityPercent}%
                    <span aria-hidden="true">{TREND_ARROW[trend]}</span>
                    <span className="sr-only">{TREND_LABEL[trend]}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-raised">
                  <div
                    className={`h-full rounded-full ${
                      zone.capacityPercent >= 85 ? "bg-signal" : "bg-pitch"
                    }`}
                    style={{ width: `${zone.capacityPercent}%` }}
                  />
                </div>
                <span className="font-data text-xs text-chalk-muted">
                  {zone.queueWaitMinutes} min wait · trend {TREND_LABEL[trend]}
                </span>
              </div>
            );
          })}
        </div>

        <IncidentBoard incidents={state.incidents} />

        <TransportPanel state={state} />

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xl text-chalk">Ask for a recommendation</h2>
          <p className="font-body text-sm text-chalk-muted">
            Ask about capacity risk, flow redirection, or anomaly detection across zones.
          </p>
        </div>

        <ChatInterface
          role="ops"
          placeholder="e.g. Which zone needs attention first?"
          suggestions={[
            "Which zone is closest to overcapacity?",
            "Recommend a crowd-flow redirection plan.",
            "Any anomalies I should flag right now?",
          ]}
        />
      </main>
    </>
  );
}