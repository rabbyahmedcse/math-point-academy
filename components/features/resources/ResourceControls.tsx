
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  FileTextIcon,
  GridIcon,
  HelpCircleIcon,
  SearchIcon,
  SortIcon,
  XIcon,
} from "@/components/ui/icons";
import {
  SORT_LABEL,
  TAB_LABEL,
  type KindFilter,
  type SortOrder,
} from "@/lib/resources";

export function ResourceSearch({
  value,
  onChange,
  placeholder = "Search homework or materials…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="group/search relative w-full sm:w-80 lg:w-96">
      {/* Search icon */}
      <span className="pointer-events-none absolute left-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all duration-300 group-focus-within/search:bg-indigo-50 group-focus-within/search:text-indigo-600">
        <SearchIcon className="h-5 w-5 transition-transform duration-300 group-focus-within/search:scale-110" />
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search homework and materials"
        autoComplete="off"
        maxLength={100}
        className={cn(
          "h-12 w-full rounded-2xl border bg-white/90 pl-14 pr-12 text-sm text-slate-900",
          "shadow-[0_3px_14px_rgba(15,23,42,0.04)] outline-none",
          "transition-all duration-300 placeholder:text-slate-400",
          "hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5",
          "focus:border-indigo-400 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10 focus:ring-4 focus:ring-indigo-500/10",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />

      {/* Clear search */}
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:rotate-90 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}

      {/* Focus accent */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 bottom-0 h-0.5 origin-center scale-x-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-transform duration-300 group-focus-within/search:scale-x-100"
      />
    </div>
  );
}

const TAB_ICON = {
  all: GridIcon,
  homework: FileTextIcon,
  quiz: HelpCircleIcon,
  material: FileTextIcon,
} as const;

const TABS: KindFilter[] = ["all", "homework", "quiz", "material"];

/** All / Homework / Quiz / Materials with live counts. */
export function ResourceFilterTabs({
  value,
  counts,
  onChange,
}: {
  value: KindFilter;
  counts: Record<KindFilter, number>;
  onChange: (k: KindFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by type"
      className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((k) => {
        const Icon = TAB_ICON[k];
        const active = value === k;

        return (
          <button
            key={k}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(k)}
            className={cn(
              "group/tab relative inline-flex h-11 shrink-0 items-center gap-2 overflow-hidden rounded-xl border px-3.5 text-sm font-semibold",
              "transition-all duration-300 ease-out",
              "hover:-translate-y-0.5 active:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200",
              active
                ? "border-indigo-600 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                : "border-slate-200 bg-white/90 text-slate-600 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-700 hover:shadow-md",
            )}
          >
            {active && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"
              />
            )}

            <Icon
              className={cn(
                "relative h-4 w-4 shrink-0 transition-transform duration-300",
                "group-hover/tab:scale-110",
              )}
            />

            <span className="relative whitespace-nowrap">{TAB_LABEL[k]}</span>

            <span
              className={cn(
                "relative inline-flex min-w-6 items-center justify-center rounded-lg px-1.5 py-0.5 text-[11px] font-bold tabular-nums transition-colors duration-200",
                active
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-500 group-hover/tab:bg-indigo-100 group-hover/tab:text-indigo-700",
              )}
            >
              {counts[k]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Accessible pill-styled native select. */
export function PillSelect({
  label,
  value,
  onChange,
  children,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <label
      className={cn(
        "group/select relative inline-flex h-11 min-w-0 max-w-full items-center rounded-xl border",
        "border-slate-200 bg-white/90 text-sm font-semibold text-slate-700",
        "shadow-[0_3px_14px_rgba(15,23,42,0.04)]",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md",
        "focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md focus-within:ring-4 focus-within:ring-indigo-500/10",
      )}
    >
      <span className="sr-only">{label}</span>

      {icon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400 transition-colors duration-200 group-focus-within/select:text-indigo-600"
        >
          {icon}
        </span>
      )}

      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-full min-w-0 max-w-[16rem] cursor-pointer appearance-none truncate rounded-xl bg-transparent py-2 pr-10 text-sm outline-none",
          icon ? "pl-10" : "pl-3.5",
        )}
      >
        {children}
      </select>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 flex items-center justify-center text-slate-400 transition-all duration-200 group-focus-within/select:rotate-180 group-focus-within/select:text-indigo-600"
      >
        <ChevronDownIcon className="h-4 w-4" />
      </span>
    </label>
  );
}

export function ResourceSortDropdown({
  value,
  onChange,
}: {
  value: SortOrder;
  onChange: (s: SortOrder) => void;
}) {
  return (
    <PillSelect
      label="Sort resources"
      value={value}
      onChange={(v) => onChange(v as SortOrder)}
      icon={<SortIcon className="h-4 w-4" />}
    >
      {(Object.keys(SORT_LABEL) as SortOrder[]).map((s) => (
        <option key={s} value={s}>
          {SORT_LABEL[s]}
        </option>
      ))}
    </PillSelect>
  );
}
