// hooks/useChatSubmit.ts
// Encapsulates the request lifecycle for the chat interface: debouncing,
// in-flight guarding, and the fetch to /api/chat. Extracted out of
// ChatInterface so that component is responsible only for rendering, and
// this logic is independently readable (and testable) without needing to
// render anything.

import { useRef, useState } from "react";
import type { UserRole } from "@/lib/mockData";

export interface ChatTurn {
  question: string;
  answer: string;
  cached: boolean;
}

const DEBOUNCE_MS = 300;

export function useChatSubmit(role: UserRole) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  async function sendQuery(query: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed || inFlightRef.current) return;

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, query: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setTurns((prev) => [
        ...prev,
        { question: trimmed, answer: data.answer, cached: data.cached },
      ]);
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }

  /** Debounces a query submission (used for the text input's form submit). */
  function submitDebounced(query: string): void {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => sendQuery(query), DEBOUNCE_MS);
  }

  /** Sends immediately, bypassing debounce (used for suggestion chips). */
  function submitImmediate(query: string): void {
    void sendQuery(query);
  }

  return { turns, isLoading, error, submitDebounced, submitImmediate };
}
