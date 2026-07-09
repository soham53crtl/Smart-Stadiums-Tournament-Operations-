// app/volunteer/page.tsx
import RoleShell from "@/components/RoleShell";
import PageHeader from "@/components/PageHeader";
import ChatInterface from "@/components/ChatInterface";
import TaskQueue from "@/components/TaskQueue";
import { getLiveState, sortTasksByUrgency } from "@/lib/mockData";

export default function VolunteerPage() {
  const state = getLiveState();
  const sortedTasks = sortTasksByUrgency(state.volunteerTasks);

  return (
    <RoleShell state={state}>
      <PageHeader eyebrow="VOLUNTEER MODE" eyebrowColor="text-pitch" title="Your task queue" />

      <TaskQueue tasks={sortedTasks} />

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
    </RoleShell>
  );
}
