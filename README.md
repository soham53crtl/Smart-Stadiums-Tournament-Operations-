# StadiumSense

A GenAI-powered assistant for **Smart Stadiums & Tournament Operations** —
built for FIFA World Cup 2026.

**Live demo:** https://stadiumsense-worldcup.vercel.app
**Repo:** https://github.com/soham53crtl/Smart-Stadiums-Tournament-Operations-

---

## Chosen vertical

**Challenge 4 — Smart Stadiums & Tournament Operations.**

Rather than building one tool for one type of user, StadiumSense answers the
question: _what does the same live stadium data mean to four different
people at the same moment?_ A 92%-full gate is a "go somewhere else" signal
to a fan, a "redirect flow now" signal to an operations lead, a "go help
here" signal to a volunteer, and a "check for an incident" signal to venue
staff. One shared context engine, four role-specific lenses.

| PS improvement area        | Where it's handled                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Navigation                 | `findShortestRoute()` in `lib/mockData.ts` — a real BFS shortest-path search over a zone adjacency graph, not the LLM guessing directions from zone names                                                                      |
| Multilingual assistance    | Fan mode — model responds in whatever language the user writes in                                                                                                                                                              |
| Transportation             | Fan mode `TransportPanel` — 5 live transit modes (metro, bus, bike share, park & ride, rideshare) with status and ETA                                                                                                          |
| Sustainability             | `getTotalEmissionsSavedKg()` in `lib/mockData.ts` — a real, code-computed running emissions-saved total across all active transit options, surfaced in both Fan and Ops mode, not an LLM estimate                              |
| Crowd management           | Ops mode — live zone capacity dashboard                                                                                                                                                                                        |
| Operational intelligence   | `detectCapacityAnomalies()` in `lib/mockData.ts` — a deterministic, code-level rule (≥85% capacity) that flags at-risk zones independently of the LLM; the model is given this pre-computed list rather than asked to infer it |
| Real-time decision support | Ops mode's anomaly banner + Staff mode — both driven by the same code-verified anomaly list, with the LLM used only to phrase the recommendation                                                                               |
| Accessibility              | `findAccessibleRoute()` + `AccessibleRouteFinder` in Staff mode — a wheelchair-constrained BFS search over real per-zone accessibility flags, plus WCAG-AA UI throughout                                                       |

**Why this matters:** every one of the 8 problem-statement areas is backed by a real, unit-tested function computing a verified fact — not left to the LLM to narrate on its own. `detectCapacityAnomalies()`, `getCapacityTrend()`, and `rankZonesByUrgency()` (tested in `tests/mockData.test.ts`) compute ground-truth crowd-management facts from a 6-reading capacity history per zone, so urgency reflects trend direction (rising/falling/stable), not just a single snapshot. `findShortestRoute()` and `findAccessibleRoute()` (tested in `tests/navigation.test.ts`) run a real breadth-first search over a zone adjacency graph — the accessible variant is constrained to wheelchair-accessible zones only, enforced by the graph search itself rather than by asking the LLM to remember which zones qualify. `getTotalEmissionsSavedKg()` computes a real running sustainability total. All of these are exposed to the LLM as a `PRE-COMPUTED FACTS` block in `lib/contextEngine.ts`, which is explicitly instructed to treat them as authoritative rather than recompute them — and the same functions are also called directly from the UI (Ops mode's zone ranking, Staff mode's `AccessibleRouteFinder`), so the logic is verifiable independent of whether the AI layer is even involved.

---

## Approach and logic

**Architecture: one context engine, four system prompts.**

`lib/mockData.ts` simulates the kind of live feed a real stadium deployment
would have — turnstile/occupancy sensors, transit APIs, incident reports —
behind a typed `LiveState` interface. Swapping mock data for a real feed
means implementing `getLiveState()` differently; nothing else changes.

`lib/contextEngine.ts` is the actual "brain." It:

- Builds a role-specific system prompt (fan / ops / volunteer / staff)
- Injects the current `LiveState` as JSON context
- Sanitizes user input against basic prompt-injection patterns before it
  reaches the model, and instructs the model itself to treat all input as
  data, never as commands
- Caches identical (role, state, query) requests for 60s to cut redundant
  API calls
- Runs a lightweight validation pass on the model's output before it's
  returned, so an empty/malformed response never reaches the UI silently

`app/api/chat/route.ts` is the only place the Gemini API key is used. It's a
server-only Next.js route; the key never reaches the browser. It also
enforces a simple per-IP rate limit (10 requests/minute) with a periodic
sweep so the tracking map doesn't grow unbounded.

**Shared structure across the four role pages.** Each of
`app/{fan,ops,volunteer,staff}/page.tsx` composes the same two shared
components — `RoleShell` (nav + live ribbon + layout wrapper) and
`PageHeader` (mode label + title) — rather than duplicating that markup
four times. Page-specific sections (`ZoneStatusGrid`, `TaskQueue`,
`IncidentBoard`, `TransportPanel`) are their own components so each page
file is a short composition of sections, not a wall of markup.
`ChatInterface.tsx` itself only renders; the request lifecycle
(debouncing, in-flight guarding, the actual fetch) lives in
`hooks/useChatSubmit.ts`, so the two concerns can be read and changed
independently. Business logic that isn't presentation — zone urgency
ranking, task sorting, anomaly detection — lives in `lib/mockData.ts`,
where it's unit tested directly rather than only reachable through
rendering a component.

**Why Gemini instead of Claude/OpenAI:** this is a student hackathon build
with no API budget. Google AI Studio's free tier requires no card and no
one-time trial credit — it's genuinely free within rate limits — so the
whole project has zero cost dependency. The context engine is model-agnostic
in design; swapping providers means changing one file.

---

## How the solution works

1. Land on `/` — see all four roles and the PS-area coverage table.
2. Pick a role. Each role page shows:
   - The shared **live ribbon** (a scoreboard-style ticker of current zone
     capacity, transit status, and weather) — proof all four views are
     reading the same underlying state, not separate demos
   - A role-specific view (zone dashboard for Ops, task queue for
     Volunteer, incident list for Staff, or just the chat for Fan)
   - A chat box wired to `/api/chat`, which calls the context engine
3. Ask a question. The same live state gets reasoned about differently
   depending on which role page you're on — try asking a similar question
   from Fan mode vs Ops mode to see the difference directly.

### Running locally

```bash
npm install
cp .env.example .env   # then paste your Gemini key into .env
npm run dev
```

Get a free key at aistudio.google.com → "Get API key."

### Testing

```bash
npm run test            # unit + integration + accessibility tests
npm run test:coverage   # coverage report
npm run lint            # must show zero warnings
npm run format:check    # must show no style issues
```

99 tests across 14 suites, ~98% statement / ~94% branch coverage. Every
component (including the shared `RoleShell`, `PageHeader`,
`ZoneStatusGrid`, `TaskQueue`, `AccessibleRouteFinder`) has its own render
test, every page (`FanPage`, `OpsPage`, `VolunteerPage`, `StaffPage`, the
landing page) has an integration test confirming it composes its sections
correctly, the `useChatSubmit` hook is tested directly with `renderHook`
(debounce timing, immediate submit, error paths) independent of any
component, and `ChatInterface`/`IncidentBoard`/`AccessibleRouteFinder`
have interaction tests (`fireEvent`) covering clicks, selections, and
form submission, not just static rendering. The navigation/accessibility
graph search (`findShortestRoute`, `findAccessibleRoute`) has its own
dedicated test suite verifying determinism, accessibility constraints,
and unreachable-zone handling. Edge cases — malformed JSON bodies,
non-`Error` thrown values, missing IP headers, malformed Gemini API
responses, expired rate-limit entries — are each covered by a dedicated
test rather than only exercised incidentally.

---

## Assumptions made

- **Mock live data, not real sensor feeds.** No real turnstile/IoT/transit
  API integration exists for a hackathon-scale demo; `lib/mockData.ts`
  simulates plausible values behind the same interface a real integration
  would use.
- **Single venue, five zones.** Scaled down from a real 16-venue tournament
  footprint for demo clarity; the data model generalizes to more
  zones/venues without structural changes.
- **In-memory rate limiting and caching**, not a shared store (e.g. Redis).
  Acceptable for a single-instance demo; noted as a known limitation rather
  than hidden.
- **Gemini 2.5 Flash**, not Claude/GPT, due to the free-tier cost
  constraint explained above — swappable via `lib/contextEngine.ts`.
- **One known, unresolved `npm audit` flag**: a moderate PostCSS advisory
  nested inside Next.js's own dependency tree. The only fix path is
  downgrading Next.js to an old canary release, which is a worse trade-off
  than leaving it — flagged here rather than silently ignored.

---

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Google Gemini API ·
Jest + Testing Library + jest-axe
