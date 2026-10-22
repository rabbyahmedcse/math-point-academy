
import type { ReactNode } from "react";

/** Plain GET form (no JS): picks a batch (+ optional extra inputs) via the URL query string. */
export function BatchFilter({
  batches,
  selected,
  children,
  label = "Show",
}: {
  batches: { _id: unknown; name: string }[];
  selected?: string;
  children?: ReactNode;
  label?: string;
}) {
  return (
    <form className="relative isolate w-full overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 p-4 shadow-[0_12px_35px_-28px_rgba(79,70,229,0.3)] sm:p-5">
      {/* Ambient decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 -z-10 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl"
      />

      <div className="relative flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Batch selection */}
        <label className="block min-w-0 flex-1 sm:min-w-52">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path
                  d="M8 8h8M8 12h5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Batch
          </span>

          <select
            name="batch"
            defaultValue={selected ?? ""}
            className="block min-h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="" disabled>
              Select a batch…
            </option>

            {batches.map((b) => (
              <option key={String(b._id)} value={String(b._id)}>
                {b.name}
              </option>
            ))}
          </select>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute"
          />
        </label>

        {/* Optional extra fields */}
        {children}

        {/* Submit */}
        <button
          type="submit"
          className="group relative inline-flex min-h-12 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/50 sm:min-w-28"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />

          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path
              d="M3.5 10h13m-5-5 5 5-5 5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="relative">{label}</span>
        </button>
      </div>
    </form>
  );
}
