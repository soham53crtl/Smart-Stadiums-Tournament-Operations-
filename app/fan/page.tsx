// app/fan/page.tsx
import RoleSwitcher from "@/components/RoleSwitcher";
import LiveRibbon from "@/components/LiveRibbon";
import ChatInterface from "@/components/ChatInterface";
import { getLiveState } from "@/lib/mockData";

export default function FanPage() {
  const state = getLiveState();

  return (
    <>
      <RoleSwitcher />
      <LiveRibbon state={state} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="font-data text-xs tracking-widest text-pitch">FAN MODE</p>
          <h1 className="font-display text-3xl text-chalk">Where should I go next?</h1>
          <p className="font-body text-sm text-chalk-muted">
            Ask in any language — about gates, food, restrooms, or the best time
            to head home to avoid the crowd.
          </p>
        </div>

        <ChatInterface
          role="fan"
          placeholder="e.g. Which gate has the shortest queue right now?"
          suggestions={[
            "Which gate has the shortest wait?",
            "¿Cuál es la mejor forma de volver a casa?",
            "Best time to leave to avoid the crowd?",
          ]}
        />
      </main>
    </>
  );
}
