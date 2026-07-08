// components/ChatInterface.tsx
"use client";

import { useRef, useState } from "react";
import type { UserRole } from "@/lib/mockData";

interface ChatInterfaceProps {
  role: UserRole;
  placeholder: string;
  suggestions?: string[];
}

interface ChatTurn {
  question: string;
  answer: string;
  cached: boolean;
}

const DEBOUNCE_MS = 300;

export default function ChatInterface({ role, placeholder, suggestions = [] }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  async function sendQuery(query: string) {
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

      setTurns((prev) => [...prev, { question: trimmed, answer: data.answer, cached: data.cached }]);
      setInput("");
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => sendQuery(input), DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-4">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendQuery(s)}
              className="rounded-full border border-slate px-3 py-1.5 font-body text-xs text-chalk-muted transition-colors hover:border-pitch hover:text-chalk"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex min-h-[200px] flex-col gap-4 rounded-lg border border-slate bg-panel p-4"
      >
        {turns.length === 0 && !isLoading && (
          <p className="font-body text-sm text-chalk-muted">
            Ask a question below to get started.
          </p>
        )}

        {turns.map((turn, i) => (
          <div key={i} className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-chalk">{turn.question}</p>
            <p className="rounded-md bg-panel-raised p-3 font-body text-sm text-chalk-muted">
              {turn.answer}
            </p>
          </div>
        ))}

        {isLoading && (
          <p className="font-body text-sm text-chalk-muted" aria-hidden="true">
            Thinking…
          </p>
        )}

        {error && (
          <p role="alert" className="font-body text-sm text-signal">
            {error}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Ask StadiumSense a question
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-slate bg-panel px-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk-muted focus:border-pitch"
        />
        <button
          type="submit"
          disabled={isLoading || input.trim().length === 0}
          className="rounded-md bg-signal px-5 py-2.5 font-display text-sm font-medium text-ink transition-opacity disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
