
import type { ReactNode } from "react";
import { BookOpenIcon, SearchIcon } from "@/components/ui/icons";

/** Skeleton shown by loading.tsx while a Homework & materials page loads. */
export function ResourceLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading homework and materials"
      className="relative space-y-6"
    >
      {/* Header skeleton */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100/70 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/50 p-4 shadow-[0_12px_40px_-28px_rgba(79,70,229,0.2)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="skeleton h-14 w-14 shrink-0 rounded-2xl sm:h-16 sm:w-16" />

            <div className="min-w-0 flex-1 space-y-3">
              <div className="skeleton h-7 w-48 max-w-full sm:h-8 sm:w-80" />
              <div className="skeleton h-4 w-40 max-w-full sm:w-96" />
            </div>
          </div>

          <div className="skeleton h-12 w-full rounded-2xl lg:max-w-sm" />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-200/20 blur-3xl"
        />
      </div>

      {/* Filter skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[28, 36, 28, 36].map((w, i) => (
              <div
                key={i}
                className="skeleton h-10 rounded-full"
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>

          <div className="skeleton hidden h-10 w-40 rounded-xl sm:block" />
        </div>
      </div>

      {/* Resource card skeletons */}
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.3)] transition-transform duration-300 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="skeleton h-16 w-16 shrink-0 rounded-2xl" />

              <div className="min-w-0 flex-1 space-y-3">
                <div className="skeleton h-5 w-2/3 max-w-md" />
                <div className="skeleton h-6 w-36 max-w-full rounded-lg" />
                <div className="skeleton h-4 w-48 max-w-full" />
              </div>

              <div className="skeleton h-12 w-full rounded-xl sm:w-40" />
            </div>

            {/* Tailwind animation; no styled-jsx or client-only dependency */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-indigo-50/60 to-transparent motion-safe:animate-pulse"
              style={{ animationDelay: `${i * 180}ms` }}
            />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** `filtered` = there are resources but none match the current search / tab. */
export function ResourceEmptyState({
  filtered,
  onClear,
  children,
}: {
  filtered: boolean;
  onClear?: () => void;
  children?: ReactNode;
}) {
  const Icon = filtered ? SearchIcon : BookOpenIcon;

  return (
    <div className="group relative isolate flex min-h-72 flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-dashed border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/50 px-5 py-12 text-center shadow-[0_16px_50px_-35px_rgba(79,70,229,0.25)] transition-all duration-300 hover:border-indigo-300 hover:shadow-[0_22px_60px_-35px_rgba(79,70,229,0.3)] sm:px-8 sm:py-14">
      {/* Ambient background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 -z-10 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl transition-transform duration-700 group-hover:scale-125"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -left-12 -z-10 h-36 w-36 rounded-full bg-indigo-200/30 blur-3xl transition-transform duration-700 group-hover:scale-125"
      />

      {/* Icon */}
      <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[1.5rem] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 text-indigo-600 shadow-lg shadow-indigo-500/10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:shadow-xl group-hover:shadow-indigo-500/15">
        <Icon className="h-9 w-9" />

        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border-[3px] border-white bg-violet-500 shadow-sm"
        />
      </span>

      {/* Message */}
      <div className="max-w-md">
        <span className="mb-2 inline-flex items-center rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
          {filtered ? "Search results" : "Learning resources"}
        </span>

        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          {filtered ? "No matching resources" : "Nothing here yet"}
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 sm:text-base">
          {filtered
            ? "Try a different search word or another filter."
            : "Homework, quizzes and study materials will appear here as soon as they are shared."}
        </p>
      </div>

      {/* Existing clear action */}
      {filtered && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="group/clear relative mt-1 inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/50"
        >
          <SearchIcon className="h-4 w-4 transition-transform duration-300 group-hover/clear:scale-110" />
          <span>Clear search &amp; filters</span>
        </button>
      )}

      {children}
    </div>
  );
}
