import { parseDelimited } from "./delimited";

export type StationRecord = {
  name: string;
  address: string | null;
  city: string | null;
  state: string;
  county: string | null;
  hours: string | null;
  phone: string | null;
  fuel: string | null;
  unleaded: boolean;
  diesel: boolean;
  latitude: number | null;
  longitude: number | null;
};

/** Known errors in the source export, corrected on import. */
const COUNTY_FIXES: Record<string, string> = {
  // Bordentown, Edgewater Park, Mt. Laurel and Southampton are in Burlington County.
  Bordentown: "Burlington",
};

const text = (value: string | undefined) => {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
};

const number = (value: string | undefined) => {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : Number(trimmed);
};

/** Parse data/source/stations.csv (NJDOT export, January 2017). */
export function parseStations(source: string): StationRecord[] {
  return parseDelimited(source).map((row) => {
    const county = text(row["County"]);
    const fuel = text(row["Type of Gas"]);
    return {
      name: text(row["Name"]) ?? "",
      address: text(row["Address"]),
      city: text(row["City"]),
      state: text(row["State"]) ?? "NJ",
      county: county ? (COUNTY_FIXES[county] ?? county) : null,
      // Some hours span two lines ("Unleaded - 24 Hours / Diesel - ...").
      hours: text(
        (row["Hours"] ?? "")
          .split(/\r\n|\r|\n/)
          .map((line) => line.trim())
          .join("\n"),
      ),
      phone: text(row["Phone Number"]),
      fuel,
      unleaded: /unleaded/i.test(fuel ?? ""),
      diesel: /diesel/i.test(fuel ?? ""),
      latitude: number(row["Latitude"]),
      longitude: number(row["Longitude"]),
    };
  });
}
