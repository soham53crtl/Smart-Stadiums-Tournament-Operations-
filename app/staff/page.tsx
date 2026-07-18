// app/staff/page.tsx
import RoleShell from "@/components/RoleShell";
import PageHeader from "@/components/PageHeader";
import ChatInterface from "@/components/ChatInterface";
import IncidentBoard from "@/components/IncidentBoard";
import AccessibleRouteFinder from "@/components/AccessibleRouteFinder";
import { getLiveState } from "@/lib/mockData";

export default function StaffPage() {
  const state = getLiveState();

  return (
    <RoleShell state={state}>
      <PageHeader
        eyebrow="STAFF MODE"
        eyebrowColor="text-signal"
        title="Accessibility & incidents"
      />

      <AccessibleRouteFinder state={state} />

      <IncidentBoard incidents={state.incidents} />

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-chalk">Describe an incident or ask for a route</h2>
        <p className="font-body text-sm text-chalk-muted">
          Describe what you&apos;re seeing in plain language, or ask for an accessible route to any
          zone.
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
    </RoleShell>
  );
}
