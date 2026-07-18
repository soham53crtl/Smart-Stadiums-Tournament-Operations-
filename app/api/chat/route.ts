// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAssistantResponse } from "@/lib/contextEngine";
import { getLiveState, type UserRole } from "@/lib/mockData";

// Demo-scope in-memory rate limiter (per IP). Production would use a shared
// store (e.g. Upstash Redis) since this map doesn't survive restarts or scale
// across multiple server instances.
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT;
}

/**
 * Removes rate-limit entries whose most recent request has aged out of the
 * window. Extracted as a standalone function (rather than an inline
 * setInterval callback) so it can be unit tested directly without waiting
 * for a real timer to fire.
 */
export function sweepExpiredRateLimitEntries(hitsMap: Map<string, number[]>, now: number): void {
  const cutoff = now - WINDOW_MS;
  for (const [ip, timestamps] of hitsMap.entries()) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) hitsMap.delete(ip);
    else hitsMap.set(ip, filtered);
  }
}

// Periodic sweep so the map doesn't grow unbounded on a long-running process.
const sweeper = setInterval(() => sweepExpiredRateLimitEntries(hits, Date.now()), WINDOW_MS);
sweeper.unref?.();

const VALID_ROLES: UserRole[] = ["fan", "ops", "volunteer", "staff"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { role, query } = (body ?? {}) as { role?: string; query?: string };

  if (!role || !VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid or missing role." }, { status: 400 });
  }
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "Query must be a non-empty string." }, { status: 400 });
  }

  try {
    const liveState = getLiveState();
    const { answer, cached } = await getAssistantResponse(role as UserRole, liveState, query);
    return NextResponse.json({ answer, cached });
  } catch (err) {
    console.error("chat route error:", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json(
      { error: "Something went wrong processing your request." },
      { status: 500 }
    );
  }
}
