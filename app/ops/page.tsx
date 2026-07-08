// app/ops/page.tsx
import RoleSwitcher from "@/components/RoleSwitcher";
import LiveRibbon from "@/components/LiveRibbon";
import ChatInterface from "@/components/ChatInterface";
import { getLiveState } from "@/lib/mockData";

export default function OpsPage() {
  const state = getLiveState();

  return (
    <>
      <RoleSwitcher />
      <LiveRibbon state={state} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="font-data text-xs tracking-widest text-signal">OPS MODE</p>
          <h1 className="font-display text-3xl text-chalk">Zone status</h1>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {state.zones.map((zone) => (
            <div
              key={zone.zoneId}
              className="flex flex-col gap-2 rounded-lg border border-slate bg-panel p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-chalk">{zone.name}</span>
                <span
                  className={`font-data text-xs ${
                    zone.capacityPercent >= 85 ? "text-signal" : "text-pitch"
                  }`}
                >
                  {zone.capacityPercent}%
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
                {zone.queueWaitMinutes} min wait
              </span>
            </div>
          ))}
        </div>

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
