# StadiumSense

A GenAI-powered assistant for **Smart Stadiums & Tournament Operations** —
built for FIFA World Cup 2026.

**Live demo:** https://stadiumsense-worldcup.vercel.app
**Repo:** https://github.com/soham53crtl/Smart-Stadiums-Tournament-Operations

---

## Chosen vertical

**Challenge 4 — Smart Stadiums & Tournament Operations.**

Rather than building one tool for one type of user, StadiumSense answers the
question: *what does the same live stadium data mean to four different
people at the same moment?* A 92%-full gate is a "go somewhere else" signal
to a fan, a "redirect flow now" signal to an operations lead, a "go help
here" signal to a volunteer, and a "check for an incident" signal to venue
staff. One shared context engine, four role-specific lenses.

| PS improvement area | Where it's handled |
|---|---|
| Navigation | Fan mode — gate/queue-aware routing |
| Multilingual assistance | Fan mode — model responds in whatever language the user writes in |
| Transportation | Fan mode — transit ETA + emissions-aware suggestions |
| Sustainability | Fan mode (transit choice) + Ops mode (transport load view) |
| Crowd management | Ops mode — live zone capacity dashboard |
| Operational intelligence | Ops mode — plain-language recommendations from live state |
| Real-time decision support | Ops mode + Staff mode — incident classification, flow suggestions |
| Accessibility | Staff mode — accessible routing, plus WCAG-AA UI throughout |

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
```

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
