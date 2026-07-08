// app/volunteer/page.tsx
import RoleSwitcher from "@/components/RoleSwitcher";
import LiveRibbon from "@/components/LiveRibbon";
import ChatInterface from "@/components/ChatInterface";
import { getLiveState } from "@/lib/mockData";

const URGENCY_COLOR: Record<string, string> = {
  high: "text-signal",
  medium: "text-chalk",
  low: "text-chalk-muted",
};

export default function VolunteerPage() {
  const state = getLiveState();
  const sortedTasks = [...state.volunteerTasks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.urgency] - order[b.urgency];
  });

  return (
    <>
      <RoleSwitcher />
      <LiveRibbon state={state} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="font-data text-xs tracking-widest text-pitch">VOLUNTEER MODE</p>
          <h1 className="font-display text-3xl text-chalk">Your task queue</h1>
        </div>

        <ul className="flex flex-col gap-3">
          {sortedTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded-lg border border-slate bg-panel p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-body text-sm text-chalk">{task.title}</span>
                <span className="font-data text-xs text-chalk-muted">
                  {task.zoneId} · {task.skillTag}
                </span>
              </div>
              <span className={`font-data text-xs uppercase ${URGENCY_COLOR[task.urgency]}`}>
                {task.urgency}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xl text-chalk">Get step-by-step help</h2>
        </div>

        <ChatInterface
          role="volunteer"
          placeholder="e.g. Walk me through the wayfinding task at Gate 3"
          suggestions={[
            "What should I do first right now?",
            "Give me steps for the accessibility escort task.",
          ]}
        />
      </main>
    </>
  );
}
