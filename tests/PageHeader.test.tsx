// tests/PageHeader.test.tsx
import { render, screen } from "@testing-library/react";
import PageHeader from "@/components/PageHeader";

describe("PageHeader", () => {
  it("renders the eyebrow label and title", () => {
    render(<PageHeader eyebrow="FAN MODE" eyebrowColor="text-pitch" title="Where should I go?" />);
    expect(screen.getByText("FAN MODE")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Where should I go?" })
    ).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <PageHeader
        eyebrow="OPS MODE"
        eyebrowColor="text-signal"
        title="Zone status"
        description="Ranked by urgency"
      />
    );
    expect(screen.getByText("Ranked by urgency")).toBeInTheDocument();
  });

  it("omits the description paragraph when none is provided", () => {
    render(<PageHeader eyebrow="STAFF MODE" eyebrowColor="text-signal" title="Incidents" />);
    // Only the title and eyebrow text nodes should be present, no extra paragraph.
    expect(screen.queryByText(/ranked by/i)).not.toBeInTheDocument();
  });
});
