// tests/TaskQueue.test.tsx
import { render, screen } from "@testing-library/react";
import TaskQueue from "@/components/TaskQueue";
import type { VolunteerTask } from "@/lib/mockData";

const tasks: VolunteerTask[] = [
  {
    id: "t1",
    title: "Assist wayfinding at Gate 3",
    zoneId: "gate-3",
    urgency: "high",
    skillTag: "navigation",
  },
  {
    id: "t2",
    title: "Restock hydration station",
    zoneId: "concourse-a",
    urgency: "medium",
    skillTag: "logistics",
  },
];

describe("TaskQueue", () => {
  it("renders every task's title, zone, and skill tag", () => {
    render(<TaskQueue tasks={tasks} />);
    expect(screen.getByText("Assist wayfinding at Gate 3")).toBeInTheDocument();
    expect(screen.getByText(/gate-3/)).toBeInTheDocument();
    expect(screen.getByText(/navigation/)).toBeInTheDocument();
  });

  it("renders the urgency label for each task", () => {
    render(<TaskQueue tasks={tasks} />);
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
  });

  it("preserves the order it is given (sorting is the caller's responsibility)", () => {
    render(<TaskQueue tasks={tasks} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Assist wayfinding at Gate 3");
    expect(items[1]).toHaveTextContent("Restock hydration station");
  });

  it("renders an empty list when given no tasks", () => {
    render(<TaskQueue tasks={[]} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
