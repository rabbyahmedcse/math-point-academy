
import type { ReactNode } from "react";
import { BookOpenIcon } from "@/components/ui/icons";

export function HomeworkMaterialsHeader({
  subtitle,
  children,
}: {
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative mb-7">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 -z-10 rounded-3xl bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/70 opacity-80 blur-xl"
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Title and icon */}
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <div className="group relative shrink-0">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-25 blur-md transition-all duration-500 group-hover:opacity-50 group-hover:blur-lg"
            />

            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-indigo-100 via-indigo-50 to-violet-100 text-indigo-600 shadow-lg shadow-indigo-500/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-2 group-hover:scale-105 sm:h-[68px] sm:w-[68px]">
              <BookOpenIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Learning Center
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Homework{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                &amp; materials
              </span>
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {subtitle}
            </p>

            <div
              aria-hidden="true"
              className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 hover:w-24"
            />
          </div>
        </div>

        {/* Search and action controls */}
        {children && (
          <div className="flex min-w-0 flex-wrap items-center gap-3 lg:justify-end">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
