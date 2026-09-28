import { describe, expect, it } from "vitest";
import { directionsUrl, placeUrl, telUrl } from "./maps";

describe("directionsUrl", () => {
  it("uses coordinates when present", () => {
    expect(directionsUrl({ latitude: 40.1, longitude: -74.2 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=40.1%2C-74.2",
    );
  });

  it("falls back to the address", () => {
    expect(directionsUrl({ latitude: null, longitude: null, address: "1400 Negron Drive, Trenton, NJ" })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=1400%20Negron%20Drive%2C%20Trenton%2C%20NJ",
    );
  });

  it("returns null with nothing to navigate to", () => {
    expect(directionsUrl({ latitude: null, longitude: null })).toBeNull();
  });
});

describe("placeUrl", () => {
  it("builds a search URL", () => {
    expect(placeUrl(40.760169, -74.0511)).toBe("https://www.google.com/maps/search/?api=1&query=40.760169,-74.0511");
  });
});

describe("telUrl", () => {
  it("formats US numbers", () => {
    expect(telUrl("609-697-1136")).toBe("tel:+16096971136");
  });

  it("dials extensions after a pause", () => {
    expect(telUrl("856-785-0040 x 5429")).toBe("tel:+18567850040,5429");
  });

  it("returns null for missing or malformed numbers", () => {
    expect(telUrl(null)).toBeNull();
    expect(telUrl("555-1234")).toBeNull();
  });
});
