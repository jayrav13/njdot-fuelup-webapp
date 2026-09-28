/**
 * Google Maps URLs (https://developers.google.com/maps/documentation/urls).
 * These need no API key. Leaving out the directions origin makes Google Maps
 * start from the user's current location on phones.
 */

export function directionsUrl(destination: {
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
}): string | null {
  let target: string;
  if (destination.latitude !== null && destination.longitude !== null) {
    target = `${destination.latitude},${destination.longitude}`;
  } else if (destination.address) {
    target = destination.address;
  } else {
    return null;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
}

export function placeUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/**
 * `tel:` link for a phone number like "856-785-0040 x 5429". The extension is
 * dialed after a pause (","), which most phones support.
 */
export function telUrl(phone: string | null): string | null {
  if (!phone) return null;
  const [main, extension] = phone.split(/\s*(?:x|ext\.?)\s*/i);
  const digits = main.replace(/\D/g, "");
  if (digits.length !== 10) return null;
  const extDigits = extension?.replace(/\D/g, "");
  return `tel:+1${digits}${extDigits ? `,${extDigits}` : ""}`;
}
