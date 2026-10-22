
import { PageHeader, StatCard } from "@/components/ui/bits";
import { FeeMonths } from "@/components/features/FeeMonths";
import { requireRole } from "@/lib/session";
import { studentFeeMonths } from "@/lib/student-data";
import { money } from "@/lib/utils";

/** Read-only dues + payment history with receipts. */
export default async function StudentFees() {
  const user = await requireRole(["student"]);
  const rows = await studentFeeMonths({
    id: user.id,
    batchId: user.batchId,
    monthlyFee: user.monthlyFee,
  });

  const due = rows.reduce(
    (s, f) => s + Math.max(f.amountDue - f.paidTotal, 0),
    0
  );

  const paid = rows.reduce((s, f) => s + f.paidTotal, 0);

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Ambient background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-0 -z-10 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-64 -z-10 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"
      />

      {/* Page heading */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-5 shadow-sm shadow-indigo-100/50 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-violet-300/20 blur-3xl"
        />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
              <path d="M3.5 10h17M7 15h3" />
            </svg>
            FEE MANAGEMENT
          </div>

          <PageHeader title="My fees" />

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Track your payments, check outstanding dues, and view your fee
            records and receipts in one place.
          </p>
        </div>
      </section>

      {/* Fee summary */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              Payment overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A summary of your paid amount and remaining dues.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Fee summary
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Total paid */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/80 p-1 shadow-sm shadow-emerald-100/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/70">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-300/15 blur-2xl transition-transform duration-500 group-hover:scale-125"
            />

            <div className="relative">
              <div className="mb-2 flex items-center justify-between px-4 pt-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Payment status
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200/70 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>

              <StatCard
                label="Total paid"
                value={money(paid)}
                tone="green"
              />

              <div className="mx-4 mb-3 mt-1 h-1 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
              </div>

              <p className="px-4 pb-3 text-xs text-slate-500">
                Total amount paid so far
              </p>
            </div>
          </div>

          {/* Outstanding */}
          <div className="group relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-white via-white to-rose-50/80 p-1 shadow-sm shadow-rose-100/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100/70">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-300/15 blur-2xl transition-transform duration-500 group-hover:scale-125"
            />

            <div className="relative">
              <div className="mb-2 flex items-center justify-between px-4 pt-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
                  Remaining balance
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200/70 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7v10M15 9.5c0-1-1.2-1.5-3-1.5s-3 .7-3 2 1.1 2 3 2 3 .7 3 2-1.2 2-3 2-3-.5-3-1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </div>

              <StatCard
                label="Outstanding"
                value={money(due)}
                tone={due ? "red" : "green"}
              />

              <div className="mx-4 mb-3 mt-1 h-1 overflow-hidden rounded-full bg-rose-100">
                <div
                  className={`h-full w-full rounded-full ${
                    due
                      ? "bg-gradient-to-r from-rose-400 to-pink-500"
                      : "bg-gradient-to-r from-emerald-400 to-teal-500"
                  }`}
                />
              </div>

              <p className="px-4 pb-3 text-xs text-slate-500">
                {due ? "Amount remaining to be paid" : "No outstanding dues"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fee months and receipts */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 transition-shadow duration-300 hover:shadow-md">
        <div className="relative overflow-hidden border-b border-indigo-100/80 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/80 px-5 py-5 sm:px-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-violet-300/20 blur-2xl"
          />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/70">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
                <path d="M14 3.5V8h4M8 12h8M8 16h8" strokeLinecap="round" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                Monthly fee records
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Review monthly dues, payment history, and available receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <FeeMonths
            rows={rows}
            receiptBase="/dashboard/student/fees/receipt"
          />
        </div>
      </section>
    </div>
  );
}
