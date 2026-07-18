// tests/navigation.test.ts
import {
  findShortestRoute,
  findAccessibleRoute,
  getAccessibleZones,
  getLiveState,
  type LiveState,
} from "@/lib/mockData";

describe("findShortestRoute", () => {
  it("returns a direct path when two zones are adjacent", () => {
    const route = findShortestRoute("gate-3", "concourse-a");
    expect(route).not.toBeNull();
    expect(route!.path).toEqual(["gate-3", "concourse-a"]);
    expect(route!.stepCount).toBe(1);
  });

  it("returns a multi-hop path when zones are not directly connected", () => {
    const route = findShortestRoute("gate-3", "gate-5");
    expect(route).not.toBeNull();
    expect(route!.path[0]).toBe("gate-3");
    expect(route!.path[route!.path.length - 1]).toBe("gate-5");
    expect(route!.stepCount).toBeGreaterThan(1);
  });

  it("returns a zero-step path when start equals destination", () => {
    const route = findShortestRoute("gate-3", "gate-3");
    expect(route).toEqual({ path: ["gate-3"], stepCount: 0 });
  });

  it("returns null for an unknown zone id", () => {
    expect(findShortestRoute("gate-3", "not-a-real-zone")).toBeNull();
    expect(findShortestRoute("not-a-real-zone", "gate-3")).toBeNull();
  });

  it("always returns the same route for the same pair (deterministic)", () => {
    const first = findShortestRoute("gate-7", "gate-5");
    const second = findShortestRoute("gate-7", "gate-5");
    expect(first).toEqual(second);
  });
});

describe("findAccessibleRoute", () => {
  const state: LiveState = getLiveState();

  it("finds a route between two wheelchair-accessible zones", () => {
    const route = findAccessibleRoute(state, "gate-3", "concourse-a");
    expect(route).not.toBeNull();
    expect(route!.path).toEqual(["gate-3", "concourse-a"]);
  });

  it("returns null when the destination is not wheelchair-accessible", () => {
    // gate-7 is marked wheelchairAccessible: false in the mock data.
    const route = findAccessibleRoute(state, "gate-3", "gate-7");
    expect(route).toBeNull();
  });

  it("returns null when the start zone is not wheelchair-accessible", () => {
    const route = findAccessibleRoute(state, "gate-7", "gate-3");
    expect(route).toBeNull();
  });

  it("never routes through a non-accessible zone even if it would be the shortest hop count", () => {
    const route = findAccessibleRoute(state, "gate-3", "gate-5");
    expect(route).not.toBeNull();
    for (const zoneId of route!.path) {
      const zone = state.zones.find((z) => z.zoneId === zoneId);
      expect(zone?.wheelchairAccessible).toBe(true);
    }
  });
});

describe("getAccessibleZones", () => {
  it("categorizes zones by wheelchair access, sensory-friendliness, and accessible restrooms", () => {
    const result = getAccessibleZones(getLiveState());
    expect(result.wheelchairAccessible).toContain("gate-3");
    expect(result.wheelchairAccessible).not.toContain("gate-7");
    expect(result.sensoryFriendly).toContain("gate-5");
    expect(result.accessibleRestrooms).toContain("concourse-a");
  });
});
