// tests/IncidentBoard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import IncidentBoard from "@/components/IncidentBoard";
import type { IncidentReport } from "@/lib/mockData";

const baseIncidents: IncidentReport[] = [
  {
    id: "inc-1",
    zoneId: "gate-3",
    description: "Minor crowd surge",
    severity: "medium",
    status: "open",
    reportedAt: "2026-07-07T00:00:00.000Z",
  },
];

describe("IncidentBoard", () => {
  it("renders the incident description, zone, and severity", () => {
    render(<IncidentBoard incidents={baseIncidents} />);
    expect(screen.getByText("Minor crowd surge")).toBeInTheDocument();
    expect(screen.getByText(/gate-3/)).toBeInTheDocument();
    expect(screen.getByText(/medium severity/i)).toBeInTheDocument();
  });

  it("advances status from open to investigating when the button is clicked", () => {
    render(<IncidentBoard incidents={baseIncidents} />);
    expect(screen.getByText("open")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /mark as investigating/i }));

    expect(screen.getByText("investigating")).toBeInTheDocument();
    expect(screen.queryByText("open")).not.toBeInTheDocument();
  });

  it("advances status from investigating to resolved, then hides the action button", () => {
    const incidents: IncidentReport[] = [{ ...baseIncidents[0], status: "investigating" }];
    render(<IncidentBoard incidents={incidents} />);

    fireEvent.click(screen.getByRole("button", { name: /mark as resolved/i }));

    expect(screen.getByText("resolved")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not show an action button for an already-resolved incident", () => {
    const incidents: IncidentReport[] = [{ ...baseIncidents[0], status: "resolved" }];
    render(<IncidentBoard incidents={incidents} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders multiple incidents independently", () => {
    const incidents: IncidentReport[] = [
      baseIncidents[0],
      { ...baseIncidents[0], id: "inc-2", description: "Spilled drink", status: "resolved" },
    ];
    render(<IncidentBoard incidents={incidents} />);
    expect(screen.getByText("Minor crowd surge")).toBeInTheDocument();
    expect(screen.getByText("Spilled drink")).toBeInTheDocument();
    // Only the still-open incident should have an action button.
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
