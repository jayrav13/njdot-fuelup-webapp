"use client";

import { useMemo } from "react";
import type { Bridge } from "@/db/schema";
import { placeUrl } from "@/lib/maps";
import { ResultsMap, type MapPoint } from "./results-map";

export function BridgesMap({ bridges }: { bridges: Bridge[] }) {
  const points = useMemo<MapPoint[]>(
    () =>
      bridges.flatMap((bridge) =>
        bridge.latitude === null || bridge.longitude === null
          ? []
          : [
              {
                id: bridge.id,
                latitude: bridge.latitude,
                longitude: bridge.longitude,
                title: `${bridge.structureNumber} · ${bridge.name}`,
                subtitle: [bridge.municipality, bridge.county].filter(Boolean).join(", "),
                href: placeUrl(bridge.latitude, bridge.longitude),
              },
            ],
      ),
    [bridges],
  );

  if (points.length === 0) return null;
  return <ResultsMap points={points} />;
}
