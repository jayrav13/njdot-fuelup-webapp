import type { Metadata } from "next";
import { connection } from "next/server";
import { StationFinder } from "@/components/station-finder";
import { listStations } from "@/db/queries";

export const metadata: Metadata = {
  title: "Stations",
  description: "NJ state fueling stations, nearest first.",
};

export default async function StationsPage() {
  await connection();
  const stations = await listStations();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight">Fueling stations</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        State fueling sites for NJDOT and partner agencies, nearest first when location is available.
      </p>
      <StationFinder stations={stations} />
    </div>
  );
}
