/**
 * @jest-environment node
 */
// tests/api.test.ts
import { NextRequest } from "next/server";

jest.mock("@/lib/contextEngine", () => ({
  getAssistantResponse: jest.fn(),
}));
jest.mock("@/lib/mockData", () => {
  const actual = jest.requireActual("@/lib/mockData");
  return { ...actual, getLiveState: jest.fn(() => actual.getLiveState()) };
});

import { POST, sweepExpiredRateLimitEntries } from "@/app/api/chat/route";
import { getAssistantResponse } from "@/lib/contextEngine";

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    (getAssistantResponse as jest.Mock).mockReset();
  });

  it("returns 400 for a malformed JSON body", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.9" },
      body: "{not valid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid role", async () => {
    const res = await POST(makeRequest({ role: "villain", query: "hi" }, "10.0.0.1"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an empty query", async () => {
    const res = await POST(makeRequest({ role: "fan", query: "" }, "10.0.0.2"));
    expect(res.status).toBe(400);
  });

  it("returns 200 with an answer for a valid request", async () => {
    (getAssistantResponse as jest.Mock).mockResolvedValue({
      answer: "Go to Gate 5",
      cached: false,
    });
    const res = await POST(makeRequest({ role: "fan", query: "Which gate?" }, "10.0.0.3"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.answer).toBe("Go to Gate 5");
  });

  it("returns 500 when the context engine throws", async () => {
    (getAssistantResponse as jest.Mock).mockRejectedValue(new Error("boom"));
    const res = await POST(makeRequest({ role: "fan", query: "Which gate?" }, "10.0.0.4"));
    expect(res.status).toBe(500);
  });

  it("returns 500 and handles a non-Error value being thrown", async () => {
    (getAssistantResponse as jest.Mock).mockRejectedValue("a plain string rejection");
    const res = await POST(makeRequest({ role: "fan", query: "Which gate?" }, "10.0.0.6"));
    expect(res.status).toBe(500);
  });

  it("falls back to 'unknown' as the rate-limit key when no forwarded-for header is present", async () => {
    (getAssistantResponse as jest.Mock).mockResolvedValue({ answer: "ok", cached: false });
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "fan", query: "no ip header" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("rate limits after repeated requests from the same IP", async () => {
    (getAssistantResponse as jest.Mock).mockResolvedValue({ answer: "ok", cached: false });
    const ip = "10.0.0.5";
    let lastStatus = 200;
    for (let i = 0; i < 12; i++) {
      const res = await POST(makeRequest({ role: "fan", query: `q${i}` }, ip));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});

describe("sweepExpiredRateLimitEntries", () => {
  const WINDOW_MS = 60_000;

  it("removes an IP entirely once all of its timestamps have aged out", () => {
    const now = 1_000_000;
    const hits = new Map<string, number[]>([["1.2.3.4", [now - WINDOW_MS - 1]]]);
    sweepExpiredRateLimitEntries(hits, now);
    expect(hits.has("1.2.3.4")).toBe(false);
  });

  it("keeps an IP's still-fresh timestamps and drops only the expired ones", () => {
    const now = 1_000_000;
    const hits = new Map<string, number[]>([["1.2.3.4", [now - WINDOW_MS - 1, now - 100]]]);
    sweepExpiredRateLimitEntries(hits, now);
    expect(hits.get("1.2.3.4")).toEqual([now - 100]);
  });

  it("leaves an IP with only fresh timestamps untouched", () => {
    const now = 1_000_000;
    const hits = new Map<string, number[]>([["1.2.3.4", [now - 10, now - 20]]]);
    sweepExpiredRateLimitEntries(hits, now);
    expect(hits.get("1.2.3.4")).toEqual([now - 10, now - 20]);
  });
});
