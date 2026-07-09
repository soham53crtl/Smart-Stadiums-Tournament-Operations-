// tests/RoleShell.test.tsx
import { render, screen } from "@testing-library/react";
import RoleShell from "@/components/RoleShell";
import { getLiveState } from "@/lib/mockData";

jest.mock("next/navigation", () => ({
  usePathname: () => "/fan",
}));

describe("RoleShell", () => {
  it("renders the role switcher navigation", () => {
    render(
      <RoleShell state={getLiveState()}>
        <p>page content</p>
      </RoleShell>
    );
    expect(screen.getByRole("navigation", { name: /switch role view/i })).toBeInTheDocument();
  });

  it("renders the live status ribbon", () => {
    render(
      <RoleShell state={getLiveState()}>
        <p>page content</p>
      </RoleShell>
    );
    expect(screen.getByRole("status", { name: /live stadium status ticker/i })).toBeInTheDocument();
  });

  it("renders its children inside the main content area", () => {
    render(
      <RoleShell state={getLiveState()}>
        <p>unique page content marker</p>
      </RoleShell>
    );
    expect(screen.getByText("unique page content marker")).toBeInTheDocument();
  });

  it("wraps children in a <main> landmark", () => {
    render(
      <RoleShell state={getLiveState()}>
        <p>content</p>
      </RoleShell>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
