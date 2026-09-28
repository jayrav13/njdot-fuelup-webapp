/**
 * NJDOT's bridge inventory stores coordinates as packed degrees-minutes-seconds
 * (DD.MMSSss, per the "ddmmss.ss" column names): 40.453661 is 40°45'36.61",
 * i.e. 40.760169°. A few records are already decimal degrees:
 *
 * - any record where either value has minutes >= 60 (impossible in DMS), and
 * - three records whose digits look like DMS with overflowing seconds but which
 *   only land in the right municipality when read as decimal (verified against
 *   Census 2020 municipal boundaries). Keyed by official structure number.
 */
const DECIMAL_STRUCTURES = new Set(["1227158", "1237159", "122B516"]);

/** Generous bounding box around New Jersey. */
export const NJ_BOUNDS = {
  south: 38.9,
  north: 41.4,
  west: -75.6,
  east: -73.85,
} as const;

export type LatLng = { latitude: number; longitude: number };

/** Split a packed DD.MMSSss value into degrees, minutes and seconds. */
export function dmsParts(value: number) {
  const [degrees, fraction] = Math.abs(value).toFixed(6).split(".");
  return {
    degrees: Number(degrees),
    minutes: Number(fraction.slice(0, 2)),
    seconds: Number(fraction.slice(2, 6)) / 100,
  };
}

export function dmsToDecimal(value: number): number {
  const { degrees, minutes, seconds } = dmsParts(value);
  return Math.sign(value) * (degrees + minutes / 60 + seconds / 3600);
}

export function isInNewJersey({ latitude, longitude }: LatLng): boolean {
  return (
    latitude >= NJ_BOUNDS.south &&
    latitude <= NJ_BOUNDS.north &&
    longitude >= NJ_BOUNDS.west &&
    longitude <= NJ_BOUNDS.east
  );
}

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

/**
 * Decimal coordinates for a bridge record, or null when the source values are
 * missing or don't decode to a point in New Jersey.
 */
export function decodeBridgeCoordinates(
  structureNumber: string,
  rawLatitude: number | null,
  rawLongitude: number | null,
): LatLng | null {
  if (rawLatitude === null || rawLongitude === null) return null;

  const alreadyDecimal =
    DECIMAL_STRUCTURES.has(structureNumber) ||
    dmsParts(rawLatitude).minutes >= 60 ||
    dmsParts(rawLongitude).minutes >= 60;

  const point = alreadyDecimal
    ? { latitude: rawLatitude, longitude: rawLongitude }
    : { latitude: dmsToDecimal(rawLatitude), longitude: dmsToDecimal(rawLongitude) };

  if (!isInNewJersey(point)) return null;
  return { latitude: round6(point.latitude), longitude: round6(point.longitude) };
}
