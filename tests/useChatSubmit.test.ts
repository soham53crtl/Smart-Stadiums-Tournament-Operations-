// tests/useChatSubmit.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatSubmit } from "@/hooks/useChatSubmit";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockApiReply(answer: string, cached = false, ok = true) {
  mockFetch.mockResolvedValueOnce({
    ok,
    json: async () => ({ answer, cached, error: ok ? undefined : "failed" }),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useChatSubmit", () => {
  it("starts with no turns, not loading, no error", () => {
    const { result } = renderHook(() => useChatSubmit("fan"));
    expect(result.current.turns).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("submitImmediate sends the request right away without waiting for the debounce timer", async () => {
    mockApiReply("Go to Gate 5");
    const { result } = renderHook(() => useChatSubmit("fan"));

    act(() => {
      result.current.submitImmediate("Which gate?");
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.turns).toHaveLength(1));
    expect(result.current.turns[0].answer).toBe("Go to Gate 5");
  });

  it("submitDebounced waits for the debounce window before firing", async () => {
    mockApiReply("Debounced answer");
    const { result } = renderHook(() => useChatSubmit("fan"));

    act(() => {
      result.current.submitDebounced("test query");
    });

    // Not yet fired immediately.
    expect(mockFetch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });

  it("only fires once for rapid repeated debounced calls (last one wins)", async () => {
    mockApiReply("Final answer");
    const { result } = renderHook(() => useChatSubmit("fan"));

    act(() => {
      result.current.submitDebounced("first");
      result.current.submitDebounced("second");
      result.current.submitDebounced("third");
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    const [, requestInit] = mockFetch.mock.calls[0];
    const body = JSON.parse(requestInit.body as string);
    expect(body.query).toBe("third");
  });

  it("sets an error message when the API responds with an error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Too many requests." }),
    });
    const { result } = renderHook(() => useChatSubmit("fan"));

    act(() => {
      result.current.submitImmediate("test");
    });

    await waitFor(() => expect(result.current.error).toBe("Too many requests."));
    expect(result.current.turns).toHaveLength(0);
  });

  it("falls back to a generic error message when the API error response has no error field", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    const { result } = renderHook(() => useChatSubmit("fan"));

    act(() => {
      result.current.submitImmediate("test");
    });

    await waitFor(() => expect(result.current.error).toMatch(/something went wrong/i));
  });

  it("sets a network error message when fetch itself rejects", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() => useChatSubmit("fan"));

    act(() => {
      result.current.submitImmediate("test");
    });

    await waitFor(() => expect(result.current.error).toMatch(/network error/i));
  });

  it("ignores an empty query without calling fetch", () => {
    const { result } = renderHook(() => useChatSubmit("fan"));
    act(() => {
      result.current.submitImmediate("   ");
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
