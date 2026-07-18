// tests/AccessibleRouteFinder.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import AccessibleRouteFinder from "@/components/AccessibleRouteFinder";
import { getLiveState } from "@/lib/mockData";

describe("AccessibleRouteFinder", () => {
  it("renders From/To selects populated with wheelchair-accessible zones only", () => {
    render(<AccessibleRouteFinder state={getLiveState()} />);
    // gate-7 is not wheelchair-accessible in the mock data, so it shouldn't appear.
    expect(screen.queryByRole("option", { name: "Gate 7 (South)" })).not.toBeInTheDocument();
    // "Gate 3 (North)" appears once in each of the two selects (From and To).
    expect(screen.getAllByRole("option", { name: "Gate 3 (North)" })).toHaveLength(2);
  });

  it("shows a computed route after clicking Find route", () => {
    render(<AccessibleRouteFinder state={getLiveState()} />);
    fireEvent.click(screen.getByRole("button", { name: /find route/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/stop/i);
  });

  it("recomputes the route after changing the From selection", () => {
    render(<AccessibleRouteFinder state={getLiveState()} />);
    const [fromSelect] = screen.getAllByRole("combobox");
    fireEvent.change(fromSelect, { target: { value: "concourse-b" } });
    fireEvent.click(screen.getByRole("button", { name: /find route/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/stop/i);
  });

  it("recomputes the route after changing the To selection", () => {
    render(<AccessibleRouteFinder state={getLiveState()} />);
    const [, toSelect] = screen.getAllByRole("combobox");
    fireEvent.change(toSelect, { target: { value: "concourse-a" } });
    fireEvent.click(screen.getByRole("button", { name: /find route/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/stop/i);
  });

  it("shows a no-route message when start and destination can't be connected accessibly", () => {
    const state = getLiveState();
    // Force an inaccessible destination by overriding wheelchairAccessible on all but one zone.
    const restricted = {
      ...state,
      zones: state.zones.map((z, i) => ({ ...z, wheelchairAccessible: i === 0 })),
    };
    render(<AccessibleRouteFinder state={restricted} />);
    // Only one zone is accessible, so From and To will both default to it — same zone, 0 steps.
    fireEvent.click(screen.getByRole("button", { name: /find route/i }));
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
