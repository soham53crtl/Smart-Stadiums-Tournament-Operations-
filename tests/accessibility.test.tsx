// tests/accessibility.test.ts
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import ChatInterface from "@/components/ChatInterface";
import RoleSwitcher from "@/components/RoleSwitcher";

expect.extend(toHaveNoViolations);

jest.mock("next/navigation", () => ({
  usePathname: () => "/fan",
}));

describe("Accessibility", () => {
  it("ChatInterface has no detectable a11y violations", async () => {
    const { container } = render(
      <ChatInterface role="fan" placeholder="Ask a question" suggestions={["Try this"]} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("RoleSwitcher has no detectable a11y violations", async () => {
    const { container } = render(<RoleSwitcher />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
