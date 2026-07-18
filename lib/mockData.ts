// lib/mockData.ts
// Simulated real-time stadium state. In a production deployment this would be
// replaced by feeds from turnstile counters, IoT occupancy sensors, transit
// APIs, and a weather service — the shape of LiveState is designed to make
// that swap a drop-in replacement (same interface, different source).

export type UserRole = "fan" | "ops" | "volunteer" | "staff";

export interface ZoneStatus {
  zoneId: string;
  name: string;
  capacityPercent: number; // 0-100, current reading
  queueWaitMinutes: number;
  capacityHistory: number[]; // last 6 readings, oldest first, current reading last
  wheelchairAccessible: boolean;
  sensoryFriendly: boolean; // low-noise, low-light zone suitable for sensory-sensitive visitors
  hasAccessibleRestroom: boolean;
}

export interface TransportStatus {
  line: string;
  mode: "metro" | "bus" | "bike_share" | "park_and_ride" | "rideshare_zone";
  status: "on_time" | "delayed" | "disrupted";
  nextDepartureMinutes: number;
  estimatedEmissionsSavedKg: number; // vs. an equivalent solo car trip
}

export type IncidentStatus = "open" | "investigating" | "resolved";

export interface IncidentReport {
  id: string;
  zoneId: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: IncidentStatus;
  reportedAt: string; // ISO timestamp
}

export interface VolunteerTask {
  id: string;
  title: string;
  zoneId: string;
  urgency: "low" | "medium" | "high";
  skillTag: string;
}

export interface LiveState {
  updatedAt: string;
  zones: ZoneStatus[];
  transport: TransportStatus[];
  weather: { condition: string; tempCelsius: number };
  incidents: IncidentReport[];
  volunteerTasks: VolunteerTask[];
}

// Indexed by zoneId for O(1) lookups instead of linear scans.
const zoneIndex = new Map<string, ZoneStatus>();

const baseState: LiveState = {
  updatedAt: new Date().toISOString(),
  zones: [
    {
      zoneId: "gate-3",
      name: "Gate 3 (North)",
      capacityPercent: 92,
      queueWaitMinutes: 18,
      capacityHistory: [58, 67, 74, 81, 88, 92],
      wheelchairAccessible: true,
      sensoryFriendly: false,
      hasAccessibleRestroom: true,
    },
    {
      zoneId: "gate-5",
      name: "Gate 5 (East)",
      capacityPercent: 41,
      queueWaitMinutes: 3,
      capacityHistory: [30, 35, 38, 40, 39, 41],
      wheelchairAccessible: true,
      sensoryFriendly: true,
      hasAccessibleRestroom: true,
    },
    {
      zoneId: "gate-7",
      name: "Gate 7 (South)",
      capacityPercent: 67,
      queueWaitMinutes: 9,
      capacityHistory: [70, 69, 68, 66, 67, 67],
      wheelchairAccessible: false,
      sensoryFriendly: false,
      hasAccessibleRestroom: false,
    },
    {
      zoneId: "concourse-a",
      name: "Concourse A",
      capacityPercent: 78,
      queueWaitMinutes: 6,
      capacityHistory: [50, 58, 64, 70, 75, 78],
      wheelchairAccessible: true,
      sensoryFriendly: false,
      hasAccessibleRestroom: true,
    },
    {
      zoneId: "concourse-b",
      name: "Concourse B",
      capacityPercent: 35,
      queueWaitMinutes: 2,
      capacityHistory: [20, 24, 28, 30, 33, 35],
      wheelchairAccessible: true,
      sensoryFriendly: true,
      hasAccessibleRestroom: true,
    },
  ],
  transport: [
    {
      line: "Metro Blue Line",
      mode: "metro",
      status: "on_time",
      nextDepartureMinutes: 6,
      estimatedEmissionsSavedKg: 2.1,
    },
    {
      line: "Shuttle Bus 12",
      mode: "bus",
      status: "delayed",
      nextDepartureMinutes: 14,
      estimatedEmissionsSavedKg: 1.4,
    },
    {
      line: "Stadium Bike Share",
      mode: "bike_share",
      status: "on_time",
      nextDepartureMinutes: 1,
      estimatedEmissionsSavedKg: 2.8,
    },
    {
      line: "Park & Ride Lot C Express",
      mode: "park_and_ride",
      status: "on_time",
      nextDepartureMinutes: 9,
      estimatedEmissionsSavedKg: 1.1,
    },
    {
      line: "Rideshare Pickup Zone B",
      mode: "rideshare_zone",
      status: "disrupted",
      nextDepartureMinutes: 22,
      estimatedEmissionsSavedKg: 0.3,
    },
  ],
  weather: { condition: "Clear", tempCelsius: 27 },
  incidents: [
    {
      id: "inc-001",
      zoneId: "gate-3",
      description: "Minor crowd surge reported near ticket scanners",
      severity: "medium",
      status: "investigating",
      reportedAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    },
    {
      id: "inc-002",
      zoneId: "concourse-a",
      description: "Spilled drink causing a slip hazard near stall 4",
      severity: "low",
      status: "open",
      reportedAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    },
  ],
  volunteerTasks: [
    {
      id: "task-001",
      title: "Assist wayfinding at Gate 3",
      zoneId: "gate-3",
      urgency: "high",
      skillTag: "navigation",
    },
    {
      id: "task-002",
      title: "Restock hydration station",
      zoneId: "concourse-a",
      urgency: "medium",
      skillTag: "logistics",
    },
    {
      id: "task-003",
      title: "Escort accessibility request",
      zoneId: "concourse-b",
      urgency: "high",
      skillTag: "accessibility",
    },
  ],
};

baseState.zones.forEach((z) => zoneIndex.set(z.zoneId, z));

/** Returns the current simulated live state. */
export function getLiveState(): LiveState {
  return { ...baseState, updatedAt: new Date().toISOString() };
}

/** O(1) zone lookup by id instead of scanning the zones array. */
export function getZoneById(zoneId: string): ZoneStatus | undefined {
  return zoneIndex.get(zoneId);
}

/**
 * Sustainability metric: total emissions saved right now across every active,
 * non-disrupted transport option. This is real arithmetic on live data, not an
 * LLM estimate — the model is given this pre-computed number rather than
 * asked to add it up itself, so it can't misreport it.
 */
export function getTotalEmissionsSavedKg(state: LiveState): number {
  return state.transport
    .filter((t) => t.status !== "disrupted")
    .reduce((sum, t) => sum + t.estimatedEmissionsSavedKg, 0);
}

/** Capacity percent at or above this threshold is flagged as an anomaly. */
export const CAPACITY_ANOMALY_THRESHOLD = 85;

export interface CapacityAnomaly {
  zoneId: string;
  name: string;
  capacityPercent: number;
}

/**
 * Deterministic, code-level anomaly detection for crowd management —
 * independent of the LLM. This is what "operational intelligence" and
 * "real-time decision support" actually run on: a fixed rule evaluated
 * against live data, with the LLM used afterward only to phrase the
 * recommendation in plain language, not to decide which zones are at risk.
 */
export function detectCapacityAnomalies(state: LiveState): CapacityAnomaly[] {
  return state.zones
    .filter((z) => z.capacityPercent >= CAPACITY_ANOMALY_THRESHOLD)
    .map((z) => ({ zoneId: z.zoneId, name: z.name, capacityPercent: z.capacityPercent }));
}

export type CapacityTrend = "rising" | "falling" | "stable";

/**
 * Compares the most recent capacity reading against the average of the prior
 * readings in a zone's history to classify its short-term trend. A zone that
 * is merely "high" but falling is a different operational situation than one
 * that is high and still climbing — this distinction is what lets Ops mode
 * prioritize zones that are getting worse over ones that have already peaked.
 */
export function getCapacityTrend(zone: ZoneStatus): CapacityTrend {
  const history = zone.capacityHistory;
  if (history.length < 2) return "stable";

  const current = history[history.length - 1];
  const prior = history.slice(0, -1);
  const priorAvg = prior.reduce((sum, v) => sum + v, 0) / prior.length;
  const delta = current - priorAvg;

  if (delta > 3) return "rising";
  if (delta < -3) return "falling";
  return "stable";
}

/**
 * Ranks zones by operational urgency: rising + over-threshold zones first,
 * then other over-threshold zones, then everything else by capacity
 * descending. This is the actual prioritization logic behind Ops mode's
 * "which zone needs attention first" — computed in code, not guessed by
 * the model.
 */
export function rankZonesByUrgency(state: LiveState): ZoneStatus[] {
  const score = (z: ZoneStatus): number => {
    const trend = getCapacityTrend(z);
    const overThreshold = z.capacityPercent >= CAPACITY_ANOMALY_THRESHOLD;
    let s = z.capacityPercent;
    if (overThreshold && trend === "rising") s += 100;
    else if (overThreshold) s += 50;
    return s;
  };
  return [...state.zones].sort((a, b) => score(b) - score(a));
}

/**
 * Sorts volunteer tasks by urgency (high first). Lives here rather than in
 * the Volunteer page component so it's unit-testable independent of any
 * rendering concerns, consistent with how zone ranking is handled.
 */
export function sortTasksByUrgency(tasks: VolunteerTask[]): VolunteerTask[] {
  const order: Record<VolunteerTask["urgency"], number> = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => order[a.urgency] - order[b.urgency]);
}

// --- Navigation ---
// A simple adjacency map of which zones physically connect to which,
// modeling the concourse layout. This is what "navigation" actually runs
// on: a real graph with a real shortest-path search, rather than the LLM
// guessing a route from zone names alone.
const ZONE_ADJACENCY: Record<string, string[]> = {
  "gate-3": ["concourse-a"],
  "gate-5": ["concourse-b"],
  "gate-7": ["concourse-a", "concourse-b"],
  "concourse-a": ["gate-3", "gate-7", "concourse-b"],
  "concourse-b": ["gate-5", "gate-7", "concourse-a"],
};

export interface RouteResult {
  path: string[]; // ordered zoneIds from start to destination, inclusive
  stepCount: number;
}

/**
 * Breadth-first search over the zone adjacency graph — the shortest path in
 * number of hops between two zones. Returns null if no path exists (e.g. an
 * unknown zoneId). This is a real graph search, not a heuristic or an LLM
 * guess: the same start/destination pair always returns the same route.
 */
export function findShortestRoute(
  startZoneId: string,
  destinationZoneId: string
): RouteResult | null {
  if (!ZONE_ADJACENCY[startZoneId] || !ZONE_ADJACENCY[destinationZoneId]) return null;
  if (startZoneId === destinationZoneId) return { path: [startZoneId], stepCount: 0 };

  const visited = new Set<string>([startZoneId]);
  const queue: string[][] = [[startZoneId]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    for (const neighbor of ZONE_ADJACENCY[current] ?? []) {
      if (visited.has(neighbor)) continue;
      const nextPath = [...path, neighbor];
      if (neighbor === destinationZoneId) {
        return { path: nextPath, stepCount: nextPath.length - 1 };
      }
      visited.add(neighbor);
      queue.push(nextPath);
    }
  }

  return null;
}

/**
 * Same shortest-path search, but restricted to wheelchair-accessible zones
 * only. This is the function Staff mode actually calls for "nearest
 * accessible route" questions — the accessibility constraint is enforced by
 * the graph search itself, not by asking the LLM to remember which zones
 * are accessible.
 */
export function findAccessibleRoute(
  state: LiveState,
  startZoneId: string,
  destinationZoneId: string
): RouteResult | null {
  const accessibleZoneIds = new Set(
    state.zones.filter((z) => z.wheelchairAccessible).map((z) => z.zoneId)
  );
  if (!accessibleZoneIds.has(startZoneId) || !accessibleZoneIds.has(destinationZoneId)) return null;
  if (startZoneId === destinationZoneId) return { path: [startZoneId], stepCount: 0 };

  const visited = new Set<string>([startZoneId]);
  const queue: string[][] = [[startZoneId]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    for (const neighbor of ZONE_ADJACENCY[current] ?? []) {
      if (!accessibleZoneIds.has(neighbor) || visited.has(neighbor)) continue;
      const nextPath = [...path, neighbor];
      if (neighbor === destinationZoneId) {
        return { path: nextPath, stepCount: nextPath.length - 1 };
      }
      visited.add(neighbor);
      queue.push(nextPath);
    }
  }

  return null;
}

/** Returns every zone flagged as wheelchair accessible, restroom-equipped, or sensory-friendly. */
export function getAccessibleZones(state: LiveState) {
  return {
    wheelchairAccessible: state.zones.filter((z) => z.wheelchairAccessible).map((z) => z.zoneId),
    sensoryFriendly: state.zones.filter((z) => z.sensoryFriendly).map((z) => z.zoneId),
    accessibleRestrooms: state.zones.filter((z) => z.hasAccessibleRestroom).map((z) => z.zoneId),
  };
}
