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

import { POST } from "@/app/api/chat/route";
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

  it("returns 400 for an invalid role", async () => {
    const res = await POST(makeRequest({ role: "villain", query: "hi" }, "10.0.0.1"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an empty query", async () => {
    const res = await POST(makeRequest({ role: "fan", query: "" }, "10.0.0.2"));
    expect(res.status).toBe(400);
  });

  it("returns 200 with an answer for a valid request", async () => {
    (getAssistantResponse as jest.Mock).mockResolvedValue({ answer: "Go to Gate 5", cached: false });
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
