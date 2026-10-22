import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative mb-6 flex animate-fade-in flex-wrap items-end justify-between gap-4 overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50/60 p-5 shadow-[0_16px_50px_-35px_rgba(79,70,229,0.35)] sm:p-6 lg:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border-[18px] border-indigo-100/40 sm:h-52 sm:w-52"
      />

      <div className="relative min-w-0 flex-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Math Point Academy
        </span>

        <h1 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="relative flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "slate",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "slate" | "green" | "red" | "amber" | "indigo";
}) {
  const tones = {
    slate: {
      text: "text-slate-900",
      bar: "from-slate-300 to-slate-400",
      icon: "bg-slate-100 text-slate-600",
    },
    green: {
      text: "text-emerald-700",
      bar: "from-emerald-400 to-teal-500",
      icon: "bg-emerald-50 text-emerald-600",
    },
    red: {
      text: "text-rose-700",
      bar: "from-rose-400 to-red-500",
      icon: "bg-rose-50 text-rose-600",
    },
    amber: {
      text: "text-amber-700",
      bar: "from-amber-300 to-orange-400",
      icon: "bg-amber-50 text-amber-600",
    },
    indigo: {
      text: "text-indigo-700",
      bar: "from-indigo-500 to-violet-500",
      icon: "bg-indigo-50 text-indigo-600",
    },
  };

  const style = tones[tone];

  return (
    <div className="group/card card card-hover relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/[0.07] sm:p-5">
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          style.bar,
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <span
          aria-hidden="true"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover/card:scale-110 group-hover/card:rotate-3",
            style.icon,
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 12h4l3-8 4 16 3-8h4" />
          </svg>
        </span>
      </div>

      <p
        className={cn(
          "mt-3 break-words text-2xl font-black tracking-tight sm:text-3xl",
          style.text,
        )}
      >
        {value}
      </p>

      {hint && (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -right-6 h-20 w-20 rounded-full bg-indigo-100/20 blur-2xl transition-all duration-300 group-hover/card:bg-indigo-200/30"
      />
    </div>
  );
}

const BADGE: Record<string, string> = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  present: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-600/10",

  partial: "border-amber-200 bg-amber-50 text-amber-700 ring-amber-600/10",
  late: "border-amber-200 bg-amber-50 text-amber-700 ring-amber-600/10",
  pending: "border-amber-200 bg-amber-50 text-amber-700 ring-amber-600/10",

  due: "border-rose-200 bg-rose-50 text-rose-700 ring-rose-600/10",
  absent: "border-rose-200 bg-rose-50 text-rose-700 ring-rose-600/10",
  rejected: "border-rose-200 bg-rose-50 text-rose-700 ring-rose-600/10",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700 ring-rose-600/10",

  inactive: "border-slate-200 bg-slate-100 text-slate-600 ring-slate-500/10",
  draft: "border-slate-200 bg-slate-100 text-slate-600 ring-slate-500/10",

  scheduled: "border-indigo-200 bg-indigo-50 text-indigo-700 ring-indigo-600/10",
};

export const Badge = ({ value }: { value: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ring-inset",
      BADGE[value.toLowerCase()] ??
        "border-slate-200 bg-slate-100 text-slate-700 ring-slate-500/10",
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        ["paid", "active", "present", "published"].includes(
          value.toLowerCase(),
        )
          ? "bg-emerald-500"
          : ["partial", "late", "pending"].includes(
                value.toLowerCase(),
              )
            ? "bg-amber-500"
            : ["due", "absent", "rejected", "cancelled"].includes(
                  value.toLowerCase(),
                )
              ? "bg-rose-500"
              : value.toLowerCase() === "scheduled"
                ? "bg-indigo-500"
                : "bg-slate-400",
      )}
    />
    {value}
  </span>
);

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-300/90 bg-gradient-to-b from-white via-white to-indigo-50/40 px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12">
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:rotate-3"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M3 12l9 4 9-4M3 17l9 4 9-4" />
        </svg>
      </span>

      <div className="max-w-md text-sm leading-6 text-slate-600">
        {children}
      </div>
    </div>
  );
}

/** Responsive table wrapper: scrolls horizontally on phones. */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-up min-w-0 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-soft)]">
      <table className="min-w-full divide-y divide-slate-100 text-left">
        {children}
      </table>
    </div>
  );
}