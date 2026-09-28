import { decodeBridgeCoordinates } from "../coordinates";
import { structureNumberKey } from "../structure-number";
import { parseDelimited } from "./delimited";

export type BridgeRecord = {
  structureNumber: string;
  structureKey: string;
  name: string;
  owner: string | null;
  route: string | null;
  milepost: number | null;
  county: string | null;
  municipality: string | null;
  sourceLatitude: number | null;
  sourceLongitude: number | null;
  latitude: number | null;
  longitude: number | null;
};

const text = (value: string | undefined) => {
  const trimmed = (value ?? "").trim().replace(/\s+/g, " ");
  return trimmed === "" ? null : trimmed;
};

const number = (value: string | undefined) => {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : Number(trimmed);
};

/** "CAPE MAY" -> "Cape May", to match how station counties are written. */
const titleCase = (value: string | null) =>
  value?.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) ?? null;

/**
 * Parse data/source/bridges.csv, NJDOT's bridge inventory as originally
 * exported on 2017-01-18. (A later re-save through Excel stripped leading zeros
 * from structure numbers and turned IDs like 043E007 into 4.3E+08; this file
 * predates that and keeps the official 7-character numbers. Don't open and
 * re-save it in Excel.)
 */
export function parseBridges(source: string): BridgeRecord[] {
  return parseDelimited(source).map((row) => {
    const structureNumber = (row["STR NO"] ?? "").trim();
    const sourceLatitude = number(row["Latitude ddmmss.ss"]);
    const sourceLongitude = number(row["Longitude ddmmss.ss"]);
    const decoded = decodeBridgeCoordinates(structureNumber, sourceLatitude, sourceLongitude);
    return {
      structureNumber,
      structureKey: structureNumberKey(structureNumber),
      // The export encodes apostrophes as underscores ("BERRY_S CREEK", "GOV_T");
      // restore the unambiguous ones and leave others (e.g. "RAMP_K") as-is.
      name: (text(row["Structure Name"]) ?? "").replace(/([A-Z])_([ST])\b/g, "$1'$2"),
      owner: text(row["Owner"]),
      route: text(row["Route"]),
      milepost: number(row["MP xxxx.xxx"]),
      county: titleCase(text(row["County"])),
      municipality: text(row["Municipality"]),
      sourceLatitude,
      sourceLongitude,
      latitude: decoded?.latitude ?? null,
      longitude: decoded?.longitude ?? null,
    };
  });
}
