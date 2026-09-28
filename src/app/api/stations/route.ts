import { listStations } from "@/db/queries";
import { parseLatLng, sortByDistance } from "@/lib/geo";

/**
 * GET /api/stations            all stations, A–Z
 * GET /api/stations?lat=&lng=  all stations with distanceMiles, nearest first
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const origin = parseLatLng(params.get("lat"), params.get("lng"));
  if (!origin.ok) return Response.json({ error: origin.error }, { status: 400 });

  const stations = await listStations();
  if (!origin.value) return Response.json({ stations });

  const sorted = sortByDistance(stations, origin.value).map((station) => ({
    ...station,
    distanceMiles: station.distanceMiles === null ? null : Math.round(station.distanceMiles * 100) / 100,
  }));
  return Response.json({ origin: origin.value, stations: sorted });
}
