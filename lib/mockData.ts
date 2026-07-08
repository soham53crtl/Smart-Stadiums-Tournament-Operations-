// lib/mockData.ts
// Simulated real-time stadium state. In a production deployment this would be
// replaced by feeds from turnstile counters, IoT occupancy sensors, transit
// APIs, and a weather service — the shape of LiveState is designed to make
// that swap a drop-in replacement (same interface, different source).

export type UserRole = "fan" | "ops" | "volunteer" | "staff";

export interface ZoneStatus {
  zoneId: string;
  name: string;
  capacityPercent: number; // 0-100
  queueWaitMinutes: number;
}

export interface TransportStatus {
  line: string;
  status: "on_time" | "delayed" | "disrupted";
  nextDepartureMinutes: number;
  estimatedEmissionsSavedKg: number; // vs. equivalent car trips
}

export interface IncidentReport {
  id: string;
  zoneId: string;
  description: string;
  severity: "low" | "medium" | "high";
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
    { zoneId: "gate-3", name: "Gate 3 (North)", capacityPercent: 92, queueWaitMinutes: 18 },
    { zoneId: "gate-5", name: "Gate 5 (East)", capacityPercent: 41, queueWaitMinutes: 3 },
    { zoneId: "gate-7", name: "Gate 7 (South)", capacityPercent: 67, queueWaitMinutes: 9 },
    { zoneId: "concourse-a", name: "Concourse A", capacityPercent: 78, queueWaitMinutes: 6 },
    { zoneId: "concourse-b", name: "Concourse B", capacityPercent: 35, queueWaitMinutes: 2 },
  ],
  transport: [
    { line: "Metro Blue Line", status: "on_time", nextDepartureMinutes: 6, estimatedEmissionsSavedKg: 2.1 },
    { line: "Shuttle Bus 12", status: "delayed", nextDepartureMinutes: 14, estimatedEmissionsSavedKg: 1.4 },
  ],
  weather: { condition: "Clear", tempCelsius: 27 },
  incidents: [
    {
      id: "inc-001",
      zoneId: "gate-3",
      description: "Minor crowd surge reported near ticket scanners",
      severity: "medium",
      reportedAt: new Date().toISOString(),
    },
  ],
  volunteerTasks: [
    { id: "task-001", title: "Assist wayfinding at Gate 3", zoneId: "gate-3", urgency: "high", skillTag: "navigation" },
    { id: "task-002", title: "Restock hydration station", zoneId: "concourse-a", urgency: "medium", skillTag: "logistics" },
    { id: "task-003", title: "Escort accessibility request", zoneId: "concourse-b", urgency: "high", skillTag: "accessibility" },
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
