import type { Station } from "@/db/schema";
import { directionsUrl, telUrl } from "@/lib/maps";
import { ClockIcon, NavigateIcon, PhoneIcon, PinIcon } from "./icons";

export function StationCard({ station }: { station: Station & { distanceMiles: number | null } }) {
  const directions = directionsUrl({
    ...station,
    address: [station.address, station.city, station.state].filter(Boolean).join(", "),
  });
  const tel = telUrl(station.phone);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold leading-snug">{station.name}</h2>
        {station.distanceMiles !== null && (
          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-700 dark:bg-brand-800/30 dark:text-brand-100">
            {station.distanceMiles.toFixed(1)} mi
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex gap-2">
          <dt>
            <PinIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <span className="sr-only">Address</span>
          </dt>
          <dd>
            {[station.address, station.city].filter(Boolean).join(", ")}
            {station.county && <span className="text-slate-400"> · {station.county} County</span>}
          </dd>
        </div>
        {station.hours && (
          <div className="flex gap-2">
            <dt>
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />
              <span className="sr-only">Hours</span>
            </dt>
            <dd className="whitespace-pre-line">{station.hours}</dd>
          </div>
        )}
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {station.unleaded && <FuelBadge>Unleaded</FuelBadge>}
        {station.diesel && <FuelBadge>Diesel</FuelBadge>}
        {!station.unleaded && !station.diesel && station.fuel && <FuelBadge>{station.fuel}</FuelBadge>}
      </div>

      <div className="mt-4 flex gap-2 pt-1 sm:mt-auto">
        {directions && (
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            <NavigateIcon className="size-4" />
            Directions
            <span className="sr-only">to {station.name} (opens Google Maps)</span>
          </a>
        )}
        {tel && (
          <a
            href={tel}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
          >
            <PhoneIcon className="size-4" />
            Call
            <span className="sr-only">{station.name} at {station.phone}</span>
          </a>
        )}
      </div>
    </article>
  );
}

function FuelBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}
