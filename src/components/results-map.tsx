"use client";

import {
  AdvancedMarker,
  APIProvider,
  ColorScheme,
  InfoWindow,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/coordinates";

export type MapPoint = {
  id: string | number;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string | null;
  href?: string | null;
  hrefLabel?: string;
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
// Advanced markers need a Map ID; Google's DEMO_MAP_ID works for development.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
const NJ_CENTER = { lat: 40.1, lng: -74.6 };

export const mapsEnabled = Boolean(API_KEY);

/**
 * Google Map of result points (plus the user's location, if known). Renders
 * nothing unless NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
 */
export function ResultsMap({
  points,
  userLocation,
  fitPoints,
}: {
  points: MapPoint[];
  userLocation?: LatLng | null;
  /** Points to zoom to (defaults to all points). Keep the array stable between renders. */
  fitPoints?: MapPoint[];
}) {
  const [selectedId, setSelectedId] = useState<MapPoint["id"] | null>(null);
  if (!API_KEY) return null;

  const selected = points.find((point) => point.id === selectedId) ?? null;

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="h-60 overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:h-96 dark:border-slate-800">
        <Map
          mapId={MAP_ID}
          defaultCenter={NJ_CENTER}
          defaultZoom={7}
          gestureHandling="cooperative"
          colorScheme={ColorScheme.FOLLOW_SYSTEM}
          streetViewControl={false}
          mapTypeControl={false}
          onClick={() => setSelectedId(null)}
        >
          <FitToPoints points={fitPoints ?? points} userLocation={userLocation} />

          {points.map((point) => (
            <AdvancedMarker
              key={point.id}
              position={{ lat: point.latitude, lng: point.longitude }}
              title={point.title}
              onClick={() => setSelectedId(point.id)}
            >
              <Pin
                background={point.id === selectedId ? "#1d4ed8" : "#2563eb"}
                borderColor="#1e3a8a"
                glyphColor="#ffffff"
                scale={point.id === selectedId ? 1.2 : 1}
              />
            </AdvancedMarker>
          ))}

          {userLocation && (
            <AdvancedMarker position={{ lat: userLocation.latitude, lng: userLocation.longitude }} title="You are here" zIndex={1000}>
              <span className="block size-4 rounded-full border-2 border-white bg-sky-500 shadow-[0_0_0_6px_rgba(14,165,233,0.25)]" />
            </AdvancedMarker>
          )}

          {selected && (
            <InfoWindow
              position={{ lat: selected.latitude, lng: selected.longitude }}
              pixelOffset={[0, -40]}
              headerContent={<strong className="text-sm text-slate-900">{selected.title}</strong>}
              onCloseClick={() => setSelectedId(null)}
            >
              <div className="max-w-56 text-sm text-slate-700">
                {selected.subtitle && <p>{selected.subtitle}</p>}
                {selected.href && (
                  <a
                    href={selected.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-semibold text-brand-700 underline"
                  >
                    {selected.hrefLabel ?? "Open in Google Maps"}
                  </a>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

/** Zoom the map to fit the current points whenever they change. */
function FitToPoints({ points, userLocation }: { points: MapPoint[]; userLocation?: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const all = points.map((point) => ({ lat: point.latitude, lng: point.longitude }));
    if (userLocation) all.push({ lat: userLocation.latitude, lng: userLocation.longitude });
    if (all.length === 0) return;
    if (all.length === 1) {
      map.setCenter(all[0]);
      map.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    all.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 48);
  }, [map, points, userLocation]);

  return null;
}
