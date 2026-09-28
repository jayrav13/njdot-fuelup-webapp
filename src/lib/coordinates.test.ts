import { describe, expect, it } from "vitest";
import { decodeBridgeCoordinates, dmsParts, dmsToDecimal, isInNewJersey } from "./coordinates";

describe("dmsParts", () => {
  it("splits packed DD.MMSSss values", () => {
    expect(dmsParts(40.453661)).toEqual({ degrees: 40, minutes: 45, seconds: 36.61 });
    expect(dmsParts(-74.030396)).toEqual({ degrees: 74, minutes: 3, seconds: 3.96 });
  });

  it("right-pads short fractions (trailing zeros were stripped in the source)", () => {
    expect(dmsParts(40.14183)).toEqual({ degrees: 40, minutes: 14, seconds: 18.3 });
    expect(dmsParts(-75)).toEqual({ degrees: 75, minutes: 0, seconds: 0 });
  });
});

describe("dmsToDecimal", () => {
  it("converts and keeps the sign", () => {
    expect(dmsToDecimal(40.453661)).toBeCloseTo(40.760169, 6);
    expect(dmsToDecimal(-74.030396)).toBeCloseTo(-74.0511, 6);
  });
});

describe("decodeBridgeCoordinates", () => {
  it("decodes DMS records (North Bergen, 0902153)", () => {
    expect(decodeBridgeCoordinates("0902153", 40.453661, -74.030396)).toEqual({
      latitude: 40.760169,
      longitude: -74.0511,
    });
  });

  it("decodes the Ben Franklin Bridge to within ~0.1 km of its published location", () => {
    const point = decodeBridgeCoordinates("4500010", 39.5712, -75.0806);
    expect(point?.latitude).toBeCloseTo(39.9531, 3);
    expect(point?.longitude).toBeCloseTo(-75.1339, 2);
  });

  it("passes through records that are already decimal (minutes >= 60)", () => {
    expect(decodeBridgeCoordinates("0906160", 40.7392, -74.0736)).toEqual({ latitude: 40.7392, longitude: -74.0736 });
  });

  it("passes through the known decimal outliers", () => {
    expect(decodeBridgeCoordinates("1227158", 40.405233, -74.507926)).toEqual({
      latitude: 40.405233,
      longitude: -74.507926,
    });
  });

  it("returns null for values that don't decode to New Jersey", () => {
    expect(decodeBridgeCoordinates("360294S", 39.1852, 74.3718)).toBeNull(); // missing minus sign
    expect(decodeBridgeCoordinates("0600058", 31.15583, -74.5471)).toBeNull();
    expect(decodeBridgeCoordinates("0600053", 39.310249, -750.01587)).toBeNull();
  });

  it("returns null when a value is missing", () => {
    expect(decodeBridgeCoordinates("0902153", null, -74.03)).toBeNull();
  });
});

describe("isInNewJersey", () => {
  it("accepts NJ and rejects elsewhere", () => {
    expect(isInNewJersey({ latitude: 40.2206, longitude: -74.7597 })).toBe(true); // Trenton
    expect(isInNewJersey({ latitude: 40.7128, longitude: -71.006 })).toBe(false);
  });
});
