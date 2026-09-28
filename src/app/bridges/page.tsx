import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { BridgeCard } from "@/components/bridge-card";
import { BridgesMap } from "@/components/bridges-map";
import { SearchIcon } from "@/components/icons";
import { MAX_QUERY_LENGTH, searchBridges } from "@/db/queries";

export const metadata: Metadata = {
  title: "Bridges",
  description: "Look up NJ bridges by structure number or name and navigate to them.",
};

const EXAMPLES = ["0902153", "1400900", "Pulaski Skyway", "Goethals"];

export default async function BridgesPage({ searchParams }: PageProps<"/bridges">) {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim().slice(0, MAX_QUERY_LENGTH);
  const result = query ? await searchBridges(query) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight">Bridges</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Search NJDOT&apos;s bridge inventory by structure number (with or without leading zeros) or by name.
      </p>

      <Form action="/bridges" className="mt-5 flex gap-2" role="search">
        <label htmlFor="bridge-query" className="sr-only">
          Structure number or name
        </label>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400" />
          <input
            id="bridge-query"
            name="q"
            type="search"
            defaultValue={query}
            // Remount when the URL changes so Back/Forward update the box.
            key={query}
            placeholder="e.g. 0902153 or Pulaski"
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            required
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-11 text-base shadow-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Search
        </button>
      </Form>

      {result === null ? (
        <div className="mt-8 text-sm text-slate-600 dark:text-slate-400">
          <p>Try one of these:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <li key={example}>
                <Link
                  href={{ pathname: "/bridges", query: { q: example } }}
                  className="inline-block rounded-full bg-white px-3.5 py-1.5 font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
                >
                  {example}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : result.total === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="font-semibold">No bridges match “{query}”.</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Check the structure number, or search for part of the name, like a road or river.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
            {result.total.toLocaleString("en-US")} {result.total === 1 ? "bridge matches" : "bridges match"} “{query}”
            {result.total > result.bridges.length && ` · showing the first ${result.bridges.length}`}
          </p>
          <BridgesMap bridges={result.bridges} />
          <ul className="grid gap-3 md:grid-cols-2">
            {result.bridges.map((bridge) => (
              <li key={bridge.id}>
                <BridgeCard bridge={bridge} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
