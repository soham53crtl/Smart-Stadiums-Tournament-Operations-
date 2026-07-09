// tests/mockData.test.ts
import {
  detectCapacityAnomalies,
  getCapacityTrend,
  getTotalEmissionsSavedKg,
  getZoneById,
  rankZonesByUrgency,
  sortTasksByUrgency,
  CAPACITY_ANOMALY_THRESHOLD,
  type LiveState,
  type VolunteerTask,
  type ZoneStatus,
} from "@/lib/mockData";

const buildState = (overrides: Partial<LiveState> = {}): LiveState => ({
  updatedAt: "2026-07-07T00:00:00.000Z",
  zones: [
    {
      zoneId: "z1",
      name: "Zone One",
      capacityPercent: 90,
      queueWaitMinutes: 10,
      capacityHistory: [60, 65, 70, 75, 80, 90],
    },
    {
      zoneId: "z2",
      name: "Zone Two",
      capacityPercent: 50,
      queueWaitMinutes: 2,
      capacityHistory: [50, 50, 50, 50, 50, 50],
    },
  ],
  transport: [
    {
      line: "A",
      mode: "metro",
      status: "on_time",
      nextDepartureMinutes: 5,
      estimatedEmissionsSavedKg: 2,
    },
    {
      line: "B",
      mode: "bus",
      status: "disrupted",
      nextDepartureMinutes: 30,
      estimatedEmissionsSavedKg: 3,
    },
  ],
  weather: { condition: "Clear", tempCelsius: 20 },
  incidents: [],
  volunteerTasks: [],
  ...overrides,
});

describe("detectCapacityAnomalies", () => {
  it("flags zones at or above the threshold", () => {
    const result = detectCapacityAnomalies(buildState());
    expect(result).toHaveLength(1);
    expect(result[0].zoneId).toBe("z1");
  });

  it("returns an empty array when no zone meets the threshold", () => {
    const state = buildState({
      zones: [
        {
          zoneId: "z1",
          name: "Zone One",
          capacityPercent: 40,
          queueWaitMinutes: 1,
          capacityHistory: [40],
        },
      ],
    });
    expect(detectCapacityAnomalies(state)).toHaveLength(0);
  });

  it("uses the exported threshold constant consistently", () => {
    const state = buildState({
      zones: [
        {
          zoneId: "z1",
          name: "Zone One",
          capacityPercent: CAPACITY_ANOMALY_THRESHOLD,
          queueWaitMinutes: 1,
          capacityHistory: [CAPACITY_ANOMALY_THRESHOLD],
        },
      ],
    });
    expect(detectCapacityAnomalies(state)).toHaveLength(1);
  });
});

describe("getTotalEmissionsSavedKg", () => {
  it("sums emissions saved only for non-disrupted transport options", () => {
    const total = getTotalEmissionsSavedKg(buildState());
    expect(total).toBe(2); // only the on_time "A" line counts; disrupted "B" excluded
  });

  it("returns 0 when all transport is disrupted", () => {
    const state = buildState({
      transport: [
        {
          line: "A",
          mode: "metro",
          status: "disrupted",
          nextDepartureMinutes: 30,
          estimatedEmissionsSavedKg: 2,
        },
      ],
    });
    expect(getTotalEmissionsSavedKg(state)).toBe(0);
  });
});

describe("getZoneById", () => {
  it("returns the matching zone from the live state's index", () => {
    const zone = getZoneById("gate-3");
    expect(zone?.zoneId).toBe("gate-3");
  });

  it("returns undefined for an unknown zone id", () => {
    expect(getZoneById("does-not-exist")).toBeUndefined();
  });
});

describe("getCapacityTrend", () => {
  const buildZone = (history: number[]): ZoneStatus => ({
    zoneId: "z",
    name: "Z",
    capacityPercent: history[history.length - 1],
    queueWaitMinutes: 0,
    capacityHistory: history,
  });

  it("classifies a clearly climbing history as rising", () => {
    expect(getCapacityTrend(buildZone([60, 65, 70, 75, 80, 90]))).toBe("rising");
  });

  it("classifies a clearly dropping history as falling", () => {
    expect(getCapacityTrend(buildZone([90, 85, 80, 75, 70, 60]))).toBe("falling");
  });

  it("classifies a flat history as stable", () => {
    expect(getCapacityTrend(buildZone([50, 50, 50, 50, 50, 50]))).toBe("stable");
  });

  it("treats a single-reading history as stable", () => {
    expect(getCapacityTrend(buildZone([50]))).toBe("stable");
  });
});

describe("rankZonesByUrgency", () => {
  it("puts a rising over-threshold zone ahead of a flat lower-capacity zone", () => {
    const state = buildState();
    const ranked = rankZonesByUrgency(state);
    expect(ranked[0].zoneId).toBe("z1");
  });

  it("does not mutate the original zones array", () => {
    const state = buildState();
    const originalOrder = state.zones.map((z) => z.zoneId);
    rankZonesByUrgency(state);
    expect(state.zones.map((z) => z.zoneId)).toEqual(originalOrder);
  });
});

describe("sortTasksByUrgency", () => {
  const buildTask = (id: string, urgency: VolunteerTask["urgency"]): VolunteerTask => ({
    id,
    title: `Task ${id}`,
    zoneId: "z1",
    urgency,
    skillTag: "general",
  });

  it("sorts high urgency tasks before medium and low", () => {
    const tasks = [buildTask("a", "low"), buildTask("b", "high"), buildTask("c", "medium")];
    const sorted = sortTasksByUrgency(tasks);
    expect(sorted.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the original array", () => {
    const tasks = [buildTask("a", "low"), buildTask("b", "high")];
    const originalOrder = tasks.map((t) => t.id);
    sortTasksByUrgency(tasks);
    expect(tasks.map((t) => t.id)).toEqual(originalOrder);
  });

  it("returns an empty array unchanged", () => {
    expect(sortTasksByUrgency([])).toEqual([]);
  });
});
