// app/staff/page.tsx
import RoleSwitcher from "@/components/RoleSwitcher";
import LiveRibbon from "@/components/LiveRibbon";
import ChatInterface from "@/components/ChatInterface";
import { getLiveState } from "@/lib/mockData";

export default function StaffPage() {
  const state = getLiveState();

  return (
    <>
      <RoleSwitcher />
      <LiveRibbon state={state} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="font-data text-xs tracking-widest text-signal">STAFF MODE</p>
          <h1 className="font-display text-3xl text-chalk">Accessibility & incidents</h1>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg text-chalk">Active incidents</h2>
          {state.incidents.length === 0 ? (
            <p className="font-body text-sm text-chalk-muted">No active incidents reported.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {state.incidents.map((incident) => (
                <li
                  key={incident.id}
                  className="flex flex-col gap-1 rounded-lg border border-slate bg-panel p-4"
                >
                  <span className="font-body text-sm text-chalk">{incident.description}</span>
                  <span className="font-data text-xs uppercase text-signal">
                    {incident.severity} · {incident.zoneId}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xl text-chalk">Describe an incident or ask for a route</h2>
          <p className="font-body text-sm text-chalk-muted">
            Describe what you&apos;re seeing in plain language, or ask for an
            accessible route to any zone.
          </p>
        </div>

        <ChatInterface
          role="staff"
          placeholder="e.g. A fan in a wheelchair needs the nearest accessible restroom"
          suggestions={[
            "Nearest wheelchair-accessible route to Concourse A.",
            "Classify: crowd pushing near the ticket scanners at Gate 3.",
          ]}
        />
      </main>
    </>
  );
}
