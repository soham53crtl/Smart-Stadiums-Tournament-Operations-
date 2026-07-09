// app/fan/page.tsx
import RoleShell from "@/components/RoleShell";
import PageHeader from "@/components/PageHeader";
import ChatInterface from "@/components/ChatInterface";
import TransportPanel from "@/components/TransportPanel";
import { getLiveState } from "@/lib/mockData";

export default function FanPage() {
  const state = getLiveState();

  return (
    <RoleShell state={state}>
      <PageHeader
        eyebrow="FAN MODE"
        eyebrowColor="text-pitch"
        title="Where should I go next?"
        description="Ask in any language — about gates, food, restrooms, or the best time to head home to avoid the crowd."
      />

      <TransportPanel state={state} />

      <ChatInterface
        role="fan"
        placeholder="e.g. Which gate has the shortest queue right now?"
        suggestions={[
          "Which gate has the shortest wait?",
          "¿Cuál es la mejor forma de volver a casa?",
          "Best time to leave to avoid the crowd?",
        ]}
      />
    </RoleShell>
  );
}
