// tests/pages.test.tsx
// Integration-level tests for each page: confirms every page renders without
// crashing and includes the sections specific to its role. Component-level
// behavior (chat submission, incident status, etc.) is already covered by
// each component's own test file — these tests exist to catch composition
// mistakes (e.g. a page forgetting to render one of its sections) that
// component-level tests can't see.

import { render, screen } from "@testing-library/react";
import FanPage from "@/app/fan/page";
import OpsPage from "@/app/ops/page";
import VolunteerPage from "@/app/volunteer/page";
import StaffPage from "@/app/staff/page";
import Home from "@/app/page";
import { getLiveState } from "@/lib/mockData";

jest.mock("@/lib/mockData", () => {
  const actual = jest.requireActual("@/lib/mockData");
  return { ...actual, getLiveState: jest.fn(actual.getLiveState) };
});

jest.mock("next/navigation", () => ({
  usePathname: () => "/fan",
}));

describe("FanPage", () => {
  it("renders the fan mode header and its sections", () => {
    render(<FanPage />);
    expect(screen.getByText("FAN MODE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Where should I go next?" })).toBeInTheDocument();
    expect(screen.getByText(/getting home/i)).toBeInTheDocument(); // TransportPanel heading
    expect(screen.getByLabelText(/ask stadiumsense a question/i)).toBeInTheDocument();
  });
});

describe("OpsPage", () => {
  it("renders the ops mode header, zone grid, incident log, and transport panel", () => {
    render(<OpsPage />);
    expect(screen.getByText("OPS MODE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Zone status" })).toBeInTheDocument();
    expect(screen.getByText("Incident log")).toBeInTheDocument();
    expect(screen.getByText(/getting home/i)).toBeInTheDocument();
  });

  it("shows the system-flagged anomaly banner when a zone is over threshold", () => {
    render(<OpsPage />);
    // The mock data has Gate 3 at 92%, above the 85% threshold.
    expect(screen.getByRole("alert")).toHaveTextContent(/system-flagged anomaly/i);
  });

  it("pluralizes the anomaly message and lists every zone when more than one is over threshold", () => {
    (getLiveState as jest.Mock).mockReturnValueOnce({
      updatedAt: "2026-01-01T00:00:00.000Z",
      zones: [
        {
          zoneId: "z1",
          name: "Zone One",
          capacityPercent: 90,
          queueWaitMinutes: 10,
          capacityHistory: [90, 90, 90, 90, 90, 90],
        },
        {
          zoneId: "z2",
          name: "Zone Two",
          capacityPercent: 88,
          queueWaitMinutes: 5,
          capacityHistory: [88, 88, 88, 88, 88, 88],
        },
      ],
      transport: [],
      weather: { condition: "Clear", tempCelsius: 20 },
      incidents: [],
      volunteerTasks: [],
    });

    render(<OpsPage />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("2 zones are above the 85% capacity threshold");
    expect(alert).toHaveTextContent("Zone One (90%)");
    expect(alert).toHaveTextContent("Zone Two (88%)");
  });
});

describe("VolunteerPage", () => {
  it("renders the volunteer mode header and task queue", () => {
    render(<VolunteerPage />);
    expect(screen.getByText("VOLUNTEER MODE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your task queue" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0);
  });
});

describe("StaffPage", () => {
  it("renders the staff mode header and incident board", () => {
    render(<StaffPage />);
    expect(screen.getByText("STAFF MODE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Accessibility & incidents" })).toBeInTheDocument();
    expect(screen.getByText("Incident log")).toBeInTheDocument();
  });
});

describe("Home (landing page)", () => {
  it("renders links to all four role pages", () => {
    render(<Home />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/fan");
    expect(hrefs).toContain("/ops");
    expect(hrefs).toContain("/volunteer");
    expect(hrefs).toContain("/staff");
  });

  it("renders the problem-statement coverage table with all 8 areas", () => {
    render(<Home />);
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Multilingual assistance")).toBeInTheDocument();
    expect(screen.getByText("Transportation")).toBeInTheDocument();
    expect(screen.getByText("Sustainability")).toBeInTheDocument();
    expect(screen.getByText("Crowd management")).toBeInTheDocument();
    expect(screen.getByText("Operational intelligence")).toBeInTheDocument();
    expect(screen.getByText("Real-time decision support")).toBeInTheDocument();
    expect(screen.getByText("Accessibility")).toBeInTheDocument();
  });
});
