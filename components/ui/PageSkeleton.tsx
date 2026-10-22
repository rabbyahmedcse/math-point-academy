/**
 * Dashboard loading skeleton.
 * Purely presentational — no data fetching or client-side JavaScript.
 */
export default function PageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard content"
      className="min-w-0 animate-pulse space-y-6"
    >
      {/* Page heading skeleton */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50/60 p-5 shadow-sm sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border-[18px] border-indigo-100/40"
        />

        <div className="relative space-y-3">
          <div className="h-5 w-32 rounded-full bg-indigo-100/90" />
          <div className="h-8 w-3/4 max-w-sm rounded-xl bg-slate-200/90 sm:h-10" />
          <div className="h-4 w-full max-w-xl rounded-lg bg-slate-200/70" />
          <div className="h-4 w-2/3 max-w-md rounded-lg bg-slate-200/60" />
        </div>
      </section>

      {/* Statistics skeleton */}
      <section
        aria-hidden="true"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
          >
            <div
              className={[
                "absolute inset-x-0 top-0 h-1",
                "bg-gradient-to-r",
                i === 0
                  ? "from-indigo-400 to-violet-500"
                  : i === 1
                    ? "from-emerald-400 to-teal-500"
                    : i === 2
                      ? "from-amber-300 to-orange-400"
                      : "from-sky-400 to-blue-500",
              ].join(" ")}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="h-3 w-24 rounded-md bg-slate-200/80" />
              <div className="h-9 w-9 rounded-xl bg-indigo-50" />
            </div>

            <div className="mt-4 h-8 w-28 rounded-lg bg-slate-200/80" />
            <div className="mt-3 h-3 w-36 max-w-full rounded-md bg-slate-100" />
          </div>
        ))}
      </section>

      {/* Main content skeleton */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-lg bg-slate-200/80" />
            <div className="h-3 w-52 max-w-full rounded-md bg-slate-200/60" />
          </div>

          <div className="h-10 w-28 rounded-xl bg-indigo-100/80" />
        </div>

        <div className="space-y-0 divide-y divide-slate-100">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200/70" />

              <div className="min-w-0 flex-1 space-y-2">
                <div
                  className="h-3.5 max-w-48 rounded-md bg-slate-200/80"
                  style={{ width: `${45 + (i % 3) * 15}%` }}
                />
                <div className="h-3 w-2/3 max-w-64 rounded-md bg-slate-100" />
              </div>

              <div className="hidden h-7 w-20 rounded-full bg-indigo-50 sm:block" />
              <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 p-4 sm:p-5">
          <div className="h-3 w-40 rounded-md bg-slate-100" />
        </div>
      </section>

      <span className="sr-only">Loading…</span>
    </div>
  );
}