import { describe, expect, it } from "vitest";
import { migrateTestDatabase } from "@/test/db";
import { countRecords, listStations, searchBridges } from "./queries";

migrateTestDatabase();

describe("migrations", () => {
  it("import every station and bridge", async () => {
    expect(await countRecords()).toEqual({ stations: 71, bridges: 6540 });
  });
});

describe("listStations", () => {
  it("lists stations A–Z", async () => {
    const stations = await listStations();
    const names = stations.map((station) => station.name);
    expect(names).toEqual([...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    expect(stations[0]).toMatchObject({ unleaded: expect.any(Boolean), diesel: expect.any(Boolean) });
  });
});

describe("searchBridges", () => {
  it("finds a bridge by its structure number with or without leading zeros", async () => {
    for (const query of ["0902153", "902153"]) {
      const { bridges } = await searchBridges(query);
      expect(bridges[0].structureNumber).toBe("0902153");
    }
  });

  it("is case-insensitive for alphanumeric structure numbers", async () => {
    const { bridges } = await searchBridges("043e007");
    expect(bridges[0].structureNumber).toBe("043E007");
  });

  it("searches names", async () => {
    const { bridges, total } = await searchBridges("pulaski");
    expect(total).toBeGreaterThan(0);
    expect(bridges.every((bridge) => /pulaski/i.test(bridge.name) || bridge.structureKey.includes("PULASKI"))).toBe(true);
  });

  it("ranks the exact structure-number match first", async () => {
    const { bridges } = await searchBridges("1400900");
    expect(bridges[0].structureNumber).toBe("1400900");
  });

  it("caps results but reports the full total", async () => {
    const result = await searchBridges("1", { limit: 10 });
    expect(result.bridges).toHaveLength(10);
    expect(result.total).toBeGreaterThan(1000);
  });

  it("returns nothing for a blank query", async () => {
    expect(await searchBridges("   ")).toEqual({ total: 0, bridges: [] });
  });

  it("treats LIKE wildcards literally", async () => {
    expect((await searchBridges("%")).total).toBe(0);
    const { bridges, total } = await searchBridges("_", { limit: 100 });
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(50);
    expect(bridges.every((bridge) => bridge.name.includes("_"))).toBe(true);
  });

  it("restores apostrophes the source encoded as underscores", async () => {
    const { bridges } = await searchBridges("berry's creek");
    expect(bridges[0]?.name).toContain("BERRY'S CREEK");
  });
});
