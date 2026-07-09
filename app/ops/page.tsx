// app/ops/page.tsx
import RoleShell from "@/components/RoleShell";
import PageHeader from "@/components/PageHeader";
import ChatInterface from "@/components/ChatInterface";
import TransportPanel from "@/components/TransportPanel";
import IncidentBoard from "@/components/IncidentBoard";
import ZoneStatusGrid from "@/components/ZoneStatusGrid";
import { detectCapacityAnomalies, getLiveState, rankZonesByUrgency } from "@/lib/mockData";

export default function OpsPage() {
  const state = getLiveState();
  const anomalies = detectCapacityAnomalies(state);
  const rankedZones = rankZonesByUrgency(state);

  return (
    <RoleShell state={state}>
      <PageHeader
        eyebrow="OPS MODE"
        eyebrowColor="text-signal"
        title="Zone status"
        description="Ranked by urgency — capacity and short-term trend combined, computed from the last 6 readings per zone."
      />

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

      <ZoneStatusGrid zones={rankedZones} />

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
    </RoleShell>
  );
}
