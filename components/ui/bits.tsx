import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex animate-fade-in flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "slate" }: { label: string; value: ReactNode; hint?: string; tone?: "slate" | "green" | "red" | "amber" | "indigo" }) {
  const tones = { slate: "text-slate-900", green: "text-emerald-600", red: "text-rose-600", amber: "text-amber-600", indigo: "text-indigo-600" };
  const bars = { slate: "from-slate-300 to-slate-400", green: "from-emerald-400 to-teal-500", red: "from-rose-400 to-red-500", amber: "from-amber-300 to-orange-400", indigo: "from-indigo-500 to-violet-500" };
  return (
    <div className="card card-hover relative overflow-hidden">
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", bars[tone])} />
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn("mt-2 text-3xl font-bold tracking-tight", tones[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const BADGE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15", active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15", present: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15", published: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  partial: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20", late: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20", pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  due: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/15", absent: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/15", rejected: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/15", cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/15",
  inactive: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15", draft: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15", scheduled: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/15",
};
export const Badge = ({ value }: { value: string }) => (
  <span className={cn("badge capitalize", BADGE[value] ?? "bg-slate-100 text-slate-700")}>{value}</span>
);

export function Empty({ children }: { children: ReactNode }) {
  return <div className="flex animate-fade-in flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-white to-slate-50/80 px-6 py-10 text-center text-sm text-slate-500">
      <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 12l9 4 9-4M3 17l9 4 9-4" /></svg>
      </span>
      <div>{children}</div>
    </div>;
}

/** Responsive table wrapper: scrolls horizontally on phones. */
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="animate-fade-up overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-soft)]"><table className="min-w-full divide-y divide-slate-100">{children}</table></div>;
}
