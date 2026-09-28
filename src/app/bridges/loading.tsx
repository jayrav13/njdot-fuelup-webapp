export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6" aria-busy="true">
      <span className="sr-only">Searching bridges…</span>
      <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-5 h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
