import { describe, expect, it } from "vitest";
import { migrateTestDatabase } from "@/test/db";
import { GET as getBridges } from "./bridges/route";
import { GET as getStations } from "./stations/route";

migrateTestDatabase();

const request = (path: string) => new Request(`http://localhost${path}`);

describe("GET /api/stations", () => {
  it("returns every station without a location", async () => {
    const response = await getStations(request("/api/stations"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.stations).toHaveLength(71);
    expect(body.stations[0]).not.toHaveProperty("distanceMiles");
  });

  it("sorts by distance when given lat/lng", async () => {
    const response = await getStations(request("/api/stations?lat=40.2206&lng=-74.7597"));
    const body = await response.json();
    expect(body.origin).toEqual({ latitude: 40.2206, longitude: -74.7597 });
    expect(body.stations[0].name).toBe("Fernwood DOT");
    expect(body.stations[0].distanceMiles).toBeCloseTo(3.23, 1);
    // Hamilton State Police has no coordinates, so it sorts last.
    expect(body.stations.at(-1)).toMatchObject({ name: "Hamilton State Police", distanceMiles: null });
  });

  it.each(["?lat=40", "?lat=abc&lng=xyz", "?lat=&lng=", "?lat=100&lng=0"])("rejects %s with 400", async (query) => {
    const response = await getStations(request(`/api/stations${query}`));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toEqual(expect.any(String));
  });
});

describe("GET /api/bridges", () => {
  it("searches by structure number", async () => {
    const response = await getBridges(request("/api/bridges?q=1400900"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.query).toBe("1400900");
    expect(body.bridges[0]).toMatchObject({
      structureNumber: "1400900",
      name: "CR 513 (GREEN POND RD) / HIBERNIA BRK",
      latitude: 40.944861,
      longitude: -74.493528,
    });
  });

  it("honors limit", async () => {
    const body = await (await getBridges(request("/api/bridges?q=1&limit=5"))).json();
    expect(body.bridges).toHaveLength(5);
    expect(body.total).toBeGreaterThan(5);
  });

  it.each(["", "?q=", "?q=%20", "?q=1&limit=0", "?q=1&limit=101", "?q=1&limit=abc", `?q=${"x".repeat(101)}`])(
    "rejects %s with 400",
    async (query) => {
      const response = await getBridges(request(`/api/bridges${query}`));
      expect(response.status).toBe(400);
    },
  );
});
