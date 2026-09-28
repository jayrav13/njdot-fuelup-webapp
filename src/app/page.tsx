import Link from "next/link";
import { connection } from "next/server";
import { BridgeIcon, FuelIcon } from "@/components/icons";
import { countRecords } from "@/db/queries";

export default async function HomePage() {
  await connection();
  const counts = await countRecords();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-14 text-center sm:py-20">
      <FuelIcon className="size-14 text-brand-600 dark:text-brand-500" />
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">NJ Fuel Up</h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
        Find nearby fueling stations and navigate to bridges, fast.
      </p>

      <div className="mt-10 flex w-full flex-col gap-4">
        <Link
          href="/stations"
          className="flex items-center justify-center gap-3 rounded-2xl bg-brand-600 px-6 py-5 text-xl font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <FuelIcon className="size-7" />
          Stations
        </Link>
        <Link
          href="/bridges"
          className="flex items-center justify-center gap-3 rounded-2xl bg-ink px-6 py-5 text-xl font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <BridgeIcon className="size-7" />
          Bridges
        </Link>
      </div>

      <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
        {counts.stations} state fueling stations · {counts.bridges.toLocaleString("en-US")} bridges
      </p>
    </div>
  );
}
