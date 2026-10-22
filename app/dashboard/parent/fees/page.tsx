
import { PageHeader, StatCard } from "@/components/ui/bits";
import { ChildPicker, NoChild } from "@/components/features/parent/ChildPicker";
import { FeeMonths } from "@/components/features/FeeMonths";
import { requireRole } from "@/lib/session";
import { resolveChild } from "@/lib/parent-data";
import { studentFeeMonths } from "@/lib/student-data";
import { money, monthStr } from "@/lib/utils";

export default async function ParentFees({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["parent"]);
  const { children, child } = await resolveChild(user.id, (await searchParams).child);
  if (!child) return <NoChild parentId={user.id} />;

  const rows = await studentFeeMonths({
    id: child.id,
    batchId: child.batchId,
    monthlyFee: child.monthlyFee,
  });

  const cur = rows.find((r) => r.month === monthStr());
  const paid = rows.reduce((s, r) => s + r.paidTotal, 0);
  const due = rows.reduce((s, r) => s + Math.max(r.amountDue - r.paidTotal, 0), 0);

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-72 -z-10 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl"
      />

      {/* Page heading */}
      <section className="rounded-3xl border border-white/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-lg shadow-indigo-950/[0.04] sm:p-7">
        <PageHeader
          title="Monthly Fee"
          subtitle={`${child.name} · ${child.studentId}`}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Fee Overview
          </span>

          <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500">
            Student ID: {child.studentId}
          </span>
        </div>
      </section>

      {/* Child selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-300 hover:shadow-md sm:p-4">
        <ChildPicker
          kids={children}
          selectedId={child.id}
          basePath="/dashboard/parent/fees"
        />
      </div>

      {/* Fee summary cards */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Fee Summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A quick overview of the selected student&apos;s fees.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Current month */}
          <div className="group rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-white p-1 shadow-md shadow-indigo-950/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="flex items-start justify-between gap-3 px-4 pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="16" rx="3" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>
              <span className="rounded-full border border-indigo-100 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                Current month
              </span>
            </div>

            <StatCard
              label="This month's fee"
              value={cur ? money(cur.amountDue) : "—"}
            />
            <p className="px-4 pb-4 text-xs leading-5 text-slate-500">
              Scheduled fee for the current month.
            </p>
          </div>

          {/* Total paid */}
          <div className="group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white to-white p-1 shadow-md shadow-emerald-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
            <div className="flex items-start justify-between gap-3 px-4 pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:rotate-[4deg] group-hover:scale-105">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M15.5 8.5c-.8-1-2-1.3-3.5-1.1-2.5.3-3 2.8-.5 3.5l1.5.4c2.8.7 2.2 3.7-.5 4-1.5.2-2.8-.2-3.7-1.3M12 5.5v13" />
                </svg>
              </div>
              <span className="rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                Payment history
              </span>
            </div>

            <StatCard
              label="Paid (all months)"
              value={money(paid)}
              tone="green"
            />
            <p className="px-4 pb-4 text-xs leading-5 text-slate-500">
              Total payments recorded across all months.
            </p>
          </div>

          {/* Total due */}
          <div className="group rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/90 via-white to-white p-1 shadow-md shadow-rose-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 sm:col-span-2 xl:col-span-1">
            <div className="flex items-start justify-between gap-3 px-4 pt-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105 ${
                due
                  ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
              }`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M12 3 22 20H2L12 3Z" />
                  <path d="M12 9v5M12 17h.01" />
                </svg>
              </div>

              <span className={`rounded-full border bg-white/90 px-2.5 py-1 text-[11px] font-bold ${
                due
                  ? "border-rose-100 text-rose-700"
                  : "border-emerald-100 text-emerald-700"
              }`}>
                {due ? "Payment due" : "All settled"}
              </span>
            </div>

            <StatCard
              label="Due (all months)"
              value={money(due)}
              tone={due ? "red" : "green"}
            />

            <p className="px-4 pb-4 text-xs leading-5 text-slate-500">
              {due
                ? "Outstanding amount across all recorded months."
                : "No outstanding fee based on the current records."}
            </p>
          </div>
        </div>
      </section>

      {/* Monthly fee records */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo-950/[0.06]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <rect x="4" y="3" width="16" height="18" rx="2.5" />
                <path d="M8 8h8M8 12h8M8 16h4" />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                Monthly Fee Records
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Review fee details and available receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 p-3 sm:p-5">
          <FeeMonths
            rows={rows}
            receiptBase="/dashboard/parent/fees/receipt"
          />
        </div>
      </section>
    </div>
  );
}
