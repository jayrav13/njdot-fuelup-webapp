import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseBridges } from "./bridges";
import { parseStations } from "./stations";
import { parseDelimited } from "./delimited";

describe("parseDelimited", () => {
  it("parses CSV with quoted commas, escaped quotes and embedded newlines", () => {
    const text = 'A,B\none,"two, ""2"""\n"multi\nline",x\n';
    expect(parseDelimited(text)).toEqual([
      { A: "one", B: 'two, "2"' },
      { A: "multi\nline", B: "x" },
    ]);
  });

  it("parses TSV with bare CR and CRLF line endings", () => {
    expect(parseDelimited("A\tB\rone\ttwo\r\nthree\tfour", "\t")).toEqual([
      { A: "one", B: "two" },
      { A: "three", B: "four" },
    ]);
  });

  it("rejects rows with the wrong number of fields", () => {
    expect(() => parseDelimited("A,B\nonly-one\n")).toThrow(/Row 2/);
  });
});

describe("parseStations (data/source/stations.csv)", () => {
  const stations = parseStations(readFileSync("data/source/stations.csv", "utf8"));
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

  it("reads coordinates and derives fuel flags", () => {
    expect(byName("Buena DOT")).toMatchObject({ latitude: 39.51554447, unleaded: true, diesel: true });
    expect(stations.filter((station) => station.latitude !== null)).toHaveLength(70);
  });

  it("keeps two-line hours", () => {
    expect(byName("Bordentown DOT")?.hours).toBe("Unleaded - 24 Hours\nDiesel - 7:30 AM - 3:45 PM");
  });
});

describe("parseBridges (data/source/bridges.csv)", () => {
  const bridges = parseBridges(readFileSync("data/source/bridges.csv", "utf8"));
  const byNumber = (structureNumber: string) => bridges.find((bridge) => bridge.structureNumber === structureNumber);

  it("imports all 6,540 bridges with unique official structure numbers", () => {
    expect(bridges).toHaveLength(6540);
    expect(new Set(bridges.map((bridge) => bridge.structureNumber)).size).toBe(6540);
    expect(new Set(bridges.map((bridge) => bridge.structureKey)).size).toBe(6540);
    expect(bridges.every((bridge) => bridge.structureNumber.length === 7)).toBe(true);
  });

  it("has no structure numbers mangled by a spreadsheet re-save", () => {
    // Excel strips leading zeros ("0902153" -> "902153") and turns IDs like
    // "043E007" into "4.3E+08". Every official number is 7 alphanumerics.
    const mangled = bridges.filter((bridge) => !/^[0-9A-Z]{7}$/.test(bridge.structureNumber));
    expect(mangled.map((bridge) => bridge.structureNumber)).toEqual([]);
    expect(bridges.filter((bridge) => bridge.structureNumber.startsWith("0")).length).toBeGreaterThan(1000);
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
