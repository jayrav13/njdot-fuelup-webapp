import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseBridges } from "./bridges";
import { parseStations } from "./stations";
import { parseTsv } from "./tsv";

describe("parseTsv", () => {
  it("handles CR line endings, quoted fields, escaped quotes and embedded newlines", () => {
    const text = 'A\tB\rone\t"two ""2"""\r"multi\rline"\tx\r';
    expect(parseTsv(text)).toEqual([
      { A: "one", B: 'two "2"' },
      { A: "multi\rline", B: "x" },
    ]);
  });

  it("rejects rows with the wrong number of fields", () => {
    expect(() => parseTsv("A\tB\nonly-one\n")).toThrow(/Row 2/);
  });
});

describe("parseStations (data/source/stations.txt)", () => {
  const stations = parseStations(readFileSync("data/source/stations.txt", "latin1"));
  const byName = (name: string) => stations.find((station) => station.name === name);

  it("imports all 71 stations", () => {
    expect(stations).toHaveLength(71);
  });

  it("keeps Hamilton State Police without coordinates", () => {
    expect(byName("Hamilton State Police")).toMatchObject({ latitude: null, longitude: null, county: "Mercer" });
  });

  it("fixes the Bordentown county error and trims whitespace", () => {
    expect(stations.filter((station) => station.county === "Bordentown")).toHaveLength(0);
    expect(byName("Bordentown DOT")?.county).toBe("Burlington");
    expect(stations.filter((station) => station.county === "Passaic")).toHaveLength(3);
  });

  it("reads the misspelled Latitutde column and derives fuel flags", () => {
    expect(byName("Buena DOT")).toMatchObject({ latitude: 39.51554447, unleaded: true, diesel: true });
    expect(stations.filter((station) => station.latitude !== null)).toHaveLength(70);
  });

  it("keeps two-line hours", () => {
    expect(byName("Bordentown DOT")?.hours).toBe("Unleaded - 24 Hours\nDiesel - 7:30 AM - 3:45 PM");
  });
});

describe("parseBridges (data/source/bridges.txt)", () => {
  const bridges = parseBridges(readFileSync("data/source/bridges.txt", "latin1"));
  const byNumber = (structureNumber: string) => bridges.find((bridge) => bridge.structureNumber === structureNumber);

  it("imports all 6,540 bridges with unique official structure numbers", () => {
    expect(bridges).toHaveLength(6540);
    expect(new Set(bridges.map((bridge) => bridge.structureNumber)).size).toBe(6540);
    expect(new Set(bridges.map((bridge) => bridge.structureKey)).size).toBe(6540);
    expect(bridges.every((bridge) => bridge.structureNumber.length === 7)).toBe(true);
  });

  it("keeps IDs that the Excel re-save had damaged", () => {
    expect(byNumber("0902153")).toBeDefined();
    expect(byNumber("043E007")).toMatchObject({ name: "CHURCH RD/S BR PENNSAUKEN CREEK", county: "Camden" });
  });

  it("decodes coordinates and keeps the source values", () => {
    expect(byNumber("1400900")).toMatchObject({
      sourceLatitude: 40.56415,
      sourceLongitude: -74.29367,
      latitude: 40.944861,
      longitude: -74.493528,
      municipality: "Rockaway township",
      route: "9014",
      milepost: 48.25,
    });
  });

  it("has exactly 10 bridges without a usable location", () => {
    expect(bridges.filter((bridge) => bridge.latitude === null)).toHaveLength(10);
  });
});
