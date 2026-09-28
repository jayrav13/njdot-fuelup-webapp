import type { LatLng } from "./coordinates";

const EARTH_RADIUS_MILES = 3958.7613;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle (straight-line) distance in miles. */
export function distanceMiles(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

type Locatable = { latitude: number | null; longitude: number | null };

/**
 * Annotate items with their distance from `origin` and sort nearest first.
 * Items without coordinates get `distanceMiles: null` and go last, in their
 * original order.
 */
export function sortByDistance<T extends Locatable>(
  items: readonly T[],
  origin: LatLng,
): (T & { distanceMiles: number | null })[] {
  return items
    .map((item) => ({
      ...item,
      distanceMiles:
        item.latitude === null || item.longitude === null
          ? null
          : distanceMiles(origin, { latitude: item.latitude, longitude: item.longitude }),
    }))
    .sort((a, b) => {
      if (a.distanceMiles === null) return b.distanceMiles === null ? 0 : 1;
      if (b.distanceMiles === null) return -1;
      return a.distanceMiles - b.distanceMiles;
    });
}

/** Parse a latitude/longitude pair from query-string values. */
export function parseLatLng(
  lat: string | null,
  lng: string | null,
): { ok: true; value: LatLng | null } | { ok: false; error: string } {
  if (lat === null && lng === null) return { ok: true, value: null };
  if (lat === null || lng === null) {
    return { ok: false, error: "Provide both lat and lng, or neither." };
  }
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (lat.trim() === "" || lng.trim() === "" || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { ok: false, error: "lat and lng must be numbers." };
  }
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return { ok: false, error: "lat must be within ±90 and lng within ±180." };
  }
  return { ok: true, value: { latitude, longitude } };
}
