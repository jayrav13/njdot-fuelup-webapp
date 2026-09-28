"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Station } from "@/db/schema";
import type { LatLng } from "@/lib/coordinates";
import { sortByDistance } from "@/lib/geo";
import { directionsUrl } from "@/lib/maps";
import { ResultsMap, type MapPoint } from "./results-map";
import { StationCard } from "./station-card";

type LocationState =
  | { status: "locating" }
  | { status: "located"; position: LatLng }
  | { status: "denied" | "timeout" | "error" };

type FuelFilter = "all" | "diesel" | "unleaded";

/** How long to wait for a position (including an unanswered permission prompt). */
const LOCATE_TIMEOUT_MS = 15_000;

const noopSubscribe = () => () => {};

export function StationFinder({ stations }: { stations: Station[] }) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => "geolocation" in navigator,
    () => true,
  );
  const [location, setLocation] = useState<LocationState>({ status: "locating" });
  const attempt = useRef(0);

  const [query, setQuery] = useState("");
  const [fuel, setFuel] = useState<FuelFilter>("all");
  const [open24, setOpen24] = useState(false);

  /**
   * Ask for the current position. The browser's own timeout doesn't cover time
   * spent on the permission prompt, so a timer of our own ends the wait if the
   * prompt is ignored; the list is usable (A–Z) the whole time regardless.
   */
  function requestPosition(id: number) {
    const timer = setTimeout(() => {
      if (attempt.current === id) setLocation({ status: "timeout" });
    }, LOCATE_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        clearTimeout(timer);
        if (attempt.current === id) {
          setLocation({ status: "located", position: { latitude: coords.latitude, longitude: coords.longitude } });
        }
      },
      (error) => {
        clearTimeout(timer);
        if (attempt.current !== id) return;
        const status = error.code === error.PERMISSION_DENIED ? "denied" : error.code === error.TIMEOUT ? "timeout" : "error";
        setLocation({ status });
      },
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
    return () => clearTimeout(timer);
  }

  useEffect(() => {
    if (!supported) return;
    return requestPosition(++attempt.current);
  }, [supported]);

  function retry() {
    setLocation({ status: "locating" });
    requestPosition(++attempt.current);
  }

  const position = location.status === "located" ? location.position : null;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = stations.filter(
      (station) =>
        (fuel === "all" || station[fuel]) &&
        (!open24 || /24 hours/i.test(station.hours ?? "")) &&
        (needle === "" ||
          [station.name, station.city, station.county, station.address].some((field) =>
            field?.toLowerCase().includes(needle),
          )),
    );
    return position ? sortByDistance(filtered, position) : filtered.map((station) => ({ ...station, distanceMiles: null }));
  }, [stations, query, fuel, open24, position]);

  const points = useMemo<MapPoint[]>(
    () =>
      visible.flatMap((station) =>
        station.latitude === null || station.longitude === null
          ? []
          : [
              {
                id: station.id,
                latitude: station.latitude,
                longitude: station.longitude,
                title: station.name,
                subtitle: [station.hours, station.fuel].filter(Boolean).join(" · "),
                href: directionsUrl(station),
                hrefLabel: "Directions",
              },
            ],
      ),
    [visible],
  );
  // With a location, zoom to the user and the few nearest stations.
  const fitPoints = useMemo(() => (position ? points.slice(0, 4) : points), [points, position]);

  return (
    <div className="mt-5 space-y-5">
      <LocationBanner status={supported ? location.status : "unsupported"} onRetry={retry} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Filter stations</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name, town or county"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base shadow-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Fuel type">
          {(
            [
              ["all", "All fuel"],
              ["unleaded", "Unleaded"],
              ["diesel", "Diesel"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={fuel === value}
              onClick={() => setFuel(value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                fuel === value
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={open24}
            onClick={() => setOpen24((value) => !value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              open24
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            24 hours
          </button>
        </div>
      </div>

      <ResultsMap points={points} userLocation={position} fitPoints={fitPoints} />

      <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
        {visible.length === stations.length
          ? `${stations.length} stations`
          : `${visible.length} of ${stations.length} stations match`}
        {position ? ", nearest first" : ", A–Z"}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">
          No stations match these filters.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((station) => (
            <li key={station.id}>
              <StationCard station={station} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const BANNERS = {
  locating: { tone: "info", text: "Finding your location to sort stations by distance…" },
  located: null,
  denied: {
    tone: "warning",
    text: "Location access is off for this site, so stations are listed A–Z. Allow location in your browser settings to see the nearest first.",
  },
  timeout: { tone: "warning", text: "Couldn't get your location in time, so stations are listed A–Z." },
  error: { tone: "warning", text: "Couldn't determine your location, so stations are listed A–Z." },
  unsupported: { tone: "warning", text: "This browser can't share its location, so stations are listed A–Z." },
} as const;

function LocationBanner({
  status,
  onRetry,
}: {
  status: LocationState["status"] | "unsupported";
  onRetry: () => void;
}) {
  const banner = BANNERS[status];
  if (!banner) return null;
  const canRetry = status === "denied" || status === "timeout" || status === "error";

  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${
        banner.tone === "info"
          ? "bg-brand-50 text-brand-800 dark:bg-brand-800/20 dark:text-brand-100"
          : "bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"
      }`}
    >
      <span className="flex items-center gap-2">
        {status === "locating" && (
          <span className="size-3 animate-ping rounded-full bg-brand-500" aria-hidden="true" />
        )}
        {banner.text}
      </span>
      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg bg-white/70 px-3 py-1.5 font-semibold ring-1 ring-current/20 hover:bg-white dark:bg-white/10"
        >
          Try again
        </button>
      )}
    </div>
  );
}
