import { describe, expect, it } from "vitest";
import { distanceMiles, parseLatLng, sortByDistance } from "./geo";

const trenton = { latitude: 40.2206, longitude: -74.7597 };
const newark = { latitude: 40.7357, longitude: -74.1724 };

describe("distanceMiles", () => {
  it("computes great-circle distance", () => {
    expect(distanceMiles(trenton, newark)).toBeCloseTo(47.1, 0);
    expect(distanceMiles(trenton, trenton)).toBe(0);
  });
});

describe("sortByDistance", () => {
  it("sorts nearest first and puts items without coordinates last", () => {
    const items = [
      { name: "unknown", latitude: null, longitude: null },
      { name: "newark", ...newark },
      { name: "trenton", ...trenton },
    ];
    const sorted = sortByDistance(items, trenton);
    expect(sorted.map((item) => item.name)).toEqual(["trenton", "newark", "unknown"]);
    expect(sorted[2].distanceMiles).toBeNull();
  });
});

describe("parseLatLng", () => {
  it("accepts both or neither", () => {
    expect(parseLatLng(null, null)).toEqual({ ok: true, value: null });
    expect(parseLatLng("40.2", "-74.7")).toEqual({ ok: true, value: { latitude: 40.2, longitude: -74.7 } });
  });

  it("rejects one-sided, non-numeric, empty and out-of-range input", () => {
    expect(parseLatLng("40", null).ok).toBe(false);
    expect(parseLatLng("abc", "xyz").ok).toBe(false);
    expect(parseLatLng("", "").ok).toBe(false);
    expect(parseLatLng("1e400", "0").ok).toBe(false);
    expect(parseLatLng("91", "0").ok).toBe(false);
  });
});
