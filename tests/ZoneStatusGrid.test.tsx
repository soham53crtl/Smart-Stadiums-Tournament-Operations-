// tests/ZoneStatusGrid.test.tsx
import { render, screen } from "@testing-library/react";
import ZoneStatusGrid from "@/components/ZoneStatusGrid";
import type { ZoneStatus } from "@/lib/mockData";

const zones: ZoneStatus[] = [
  {
    zoneId: "z1",
    name: "Gate 3 (North)",
    capacityPercent: 92,
    queueWaitMinutes: 18,
    capacityHistory: [60, 65, 70, 80, 88, 92],
  },
  {
    zoneId: "z2",
    name: "Concourse B",
    capacityPercent: 35,
    queueWaitMinutes: 2,
    capacityHistory: [35, 35, 35, 35, 35, 35],
  },
];

describe("ZoneStatusGrid", () => {
  it("renders every zone's name and capacity", () => {
    render(<ZoneStatusGrid zones={zones} />);
    expect(screen.getByText("Gate 3 (North)")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("Concourse B")).toBeInTheDocument();
    expect(screen.getByText("35%")).toBeInTheDocument();
  });

  it("shows a screen-reader-readable trend label for each zone", () => {
    render(<ZoneStatusGrid zones={zones} />);
    expect(screen.getByText("rising")).toBeInTheDocument();
    expect(screen.getByText("stable")).toBeInTheDocument();
  });

  it("renders the wait time for each zone", () => {
    render(<ZoneStatusGrid zones={zones} />);
    expect(screen.getByText(/18 min wait/)).toBeInTheDocument();
    expect(screen.getByText(/2 min wait/)).toBeInTheDocument();
  });

  it("renders nothing but an empty grid when given no zones", () => {
    const { container } = render(<ZoneStatusGrid zones={[]} />);
    expect(container.querySelectorAll("[class*='rounded-lg']")).toHaveLength(0);
  });
});
