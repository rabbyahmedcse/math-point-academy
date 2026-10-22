
"use client";

import { useEffect } from "react";
import { ExclamationIcon, RefreshIcon } from "@/components/ui/icons";

export default function ResourceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[homework & materials]", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="relative isolate mx-auto mt-8 w-full max-w-lg px-3 sm:mt-12 sm:px-0"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-rose-100/70 via-white to-orange-100/60 blur-2xl"
      />

      <section className="relative overflow-hidden rounded-3xl border border-rose-100/90 bg-white/95 px-5 py-9 text-center shadow-[0_24px_70px_-35px_rgba(225,29,72,0.22)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_28px_80px_-35px_rgba(225,29,72,0.3)] sm:px-9 sm:py-11">
        {/* Decorative accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full border-[22px] border-rose-50/80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-orange-100/50 blur-2xl"
        />

        <div className="relative flex flex-col items-center gap-4">
          {/* Error icon */}
          <div className="group relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[1.6rem] bg-rose-300/30 blur-xl transition-all duration-500 group-hover:bg-rose-300/50"
            />

            <span className="relative flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50 text-rose-500 shadow-lg shadow-rose-500/10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-3">
              <ExclamationIcon className="h-9 w-9" />
            </span>

            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-white shadow-sm">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path
                  d="M6 6l8 8M14 6l-8 8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>

          {/* Status badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Something went wrong
          </span>

          {/* Error message */}
          <div className="max-w-sm">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              We couldn&apos;t load your resources
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Something went wrong while loading your homework and materials.
              Please check your internet connection and try again.
            </p>
          </div>

          {/* Retry action */}
          <button
            type="button"
            onClick={reset}
            className="group relative mt-1 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/50"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />

            <RefreshIcon className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />

            <span className="relative">Try again</span>
          </button>

          {/* Helpful footer */}
          <div className="mt-2 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="7.5" />
              <path
                d="M10 9v4m0-7h.01"
                strokeLinecap="round"
              />
            </svg>

            <span>
              If the problem continues, please try again later.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
