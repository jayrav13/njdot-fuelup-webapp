import type { Bridge } from "@/db/schema";
import { placeUrl } from "@/lib/maps";
import { NavigateIcon } from "./icons";

export function BridgeCard({ bridge }: { bridge: Bridge }) {
  const location = [bridge.municipality, bridge.county && `${bridge.county} County`].filter(Boolean).join(", ");
  const route = [bridge.route && `Route ${bridge.route}`, bridge.milepost !== null && `MP ${bridge.milepost}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm font-semibold tracking-wide text-brand-700 dark:text-brand-500">
          {bridge.structureNumber}
        </span>
        {bridge.owner && (
          <span className="truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {bridge.owner}
          </span>
        )}
      </div>
      <h2 className="mt-1.5 font-semibold leading-snug">{bridge.name}</h2>
      {location && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{location}</p>}
      {route && <p className="text-sm text-slate-500 dark:text-slate-400">{route}</p>}

      <div className="mt-4 pt-1 sm:mt-auto">
        {bridge.latitude !== null && bridge.longitude !== null ? (
          <a
            href={placeUrl(bridge.latitude, bridge.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            <NavigateIcon className="size-4" />
            Go
            <span className="sr-only">to bridge {bridge.structureNumber} (opens Google Maps)</span>
          </a>
        ) : (
          <p className="rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            No usable location in NJDOT&apos;s data
          </p>
        )}
      </div>
    </article>
  );
}
