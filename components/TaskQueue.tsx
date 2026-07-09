// components/TaskQueue.tsx
import type { VolunteerTask } from "@/lib/mockData";

interface TaskQueueProps {
  tasks: VolunteerTask[];
}

const URGENCY_COLOR: Record<string, string> = {
  high: "text-signal",
  medium: "text-chalk",
  low: "text-chalk-muted",
};

export default function TaskQueue({ tasks }: TaskQueueProps) {
  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
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
  );
}
