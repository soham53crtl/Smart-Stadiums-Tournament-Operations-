// tests/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatInterface from "@/components/ChatInterface";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
  jest.useFakeTimers({ advanceTimers: true });
});

afterEach(() => {
  jest.useRealTimers();
});

function mockApiReply(answer: string) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ answer, cached: false }),
  });
}

describe("ChatInterface", () => {
  it("shows the placeholder prompt before any question is asked", () => {
    render(<ChatInterface role="fan" placeholder="Ask something" />);
    expect(screen.getByText(/ask a question below to get started/i)).toBeInTheDocument();
  });

  it("renders suggestion chips and submits one immediately on click", async () => {
    mockApiReply("Gate 5 has the shortest wait.");
    render(<ChatInterface role="fan" placeholder="Ask" suggestions={["Which gate?"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Which gate?" }));

    await waitFor(() => expect(screen.getByText("Which gate?")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByText("Gate 5 has the shortest wait.")).toBeInTheDocument()
    );
  });

  it("submits the typed input via the form and clears the field", async () => {
    mockApiReply("Here is your answer.");
    render(<ChatInterface role="ops" placeholder="Ask" />);

    const input = screen.getByLabelText(/ask stadiumsense a question/i);
    fireEvent.change(input, { target: { value: "What's the status?" } });
    fireEvent.submit(screen.getByRole("button", { name: "Ask" }).closest("form")!);

    await waitFor(() => expect(screen.getByText("Here is your answer.")).toBeInTheDocument());
    expect(input).toHaveValue("");
  });

  it("disables the Ask button while the input is empty", () => {
    render(<ChatInterface role="fan" placeholder="Ask" />);
    expect(screen.getByRole("button", { name: "Ask" })).toBeDisabled();
  });

  it("enables the Ask button once text is typed", () => {
    render(<ChatInterface role="fan" placeholder="Ask" />);
    const input = screen.getByLabelText(/ask stadiumsense a question/i);
    fireEvent.change(input, { target: { value: "hello" } });
    expect(screen.getByRole("button", { name: "Ask" })).not.toBeDisabled();
  });

  it("shows an error message when the API call fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Rate limited." }) });
    render(<ChatInterface role="fan" placeholder="Ask" suggestions={["Try this"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Try this" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Rate limited."));
  });
});
