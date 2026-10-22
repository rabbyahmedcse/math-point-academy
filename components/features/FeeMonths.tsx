
import Link from "next/link";
import { Badge, Empty, TableWrap } from "@/components/ui/bits";
import { formatDate, formatMonth, money } from "@/lib/utils";
import type { FeeMonthRow } from "@/lib/student-data";

/** Read-only month-by-month fees with payments and receipt links (used by Student and Parent pages). */
export function FeeMonths({
  rows,
  receiptBase,
}: {
  rows: FeeMonthRow[];
  receiptBase: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-400" />
        <div className="p-5 sm:p-8">
          <Empty>No fee records yet.</Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {rows.map((f) => {
        const due = Math.max(f.amountDue - f.paidTotal, 0);
        const progress =
          f.amountDue > 0
            ? Math.min((f.paidTotal / f.amountDue) * 100, 100)
            : 0;

        return (
          <section
            key={f.key}
            className="group relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-30px_rgba(15,23,42,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_20px_50px_-30px_rgba(79,70,229,0.3)]"
          >
            {/* Decorative accent */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-400" />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 -z-10 h-36 w-36 rounded-full bg-violet-100/40 blur-3xl transition-transform duration-500 group-hover:scale-150"
            />

            {/* Month header */}
            <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white via-indigo-50/25 to-violet-50/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 shadow-inner transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path
                      d="M16 3v4M8 3v4M3 10h18"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                    Monthly fee
                  </p>
                  <h2 className="mt-1 break-words text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                    {formatMonth(f.month)}
                  </h2>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-xs font-semibold text-slate-500">
                  Payment status
                </span>
                <Badge value={f.status} />
              </div>
            </div>

            {/* Fee summary */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 to-white p-4 transition-colors hover:border-indigo-200">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total fee
                    </p>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 10h18M7 15h3" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {money(f.amountDue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-white p-4 transition-colors hover:border-emerald-200">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total paid
                    </p>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 break-words text-xl font-black tracking-tight text-emerald-700 sm:text-2xl">
                    {money(f.paidTotal)}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-4 transition-colors ${
                    due > 0
                      ? "border-rose-100 bg-gradient-to-br from-rose-50/90 to-white hover:border-rose-200"
                      : "border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-white hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Remaining due
                    </p>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                        due > 0
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {due > 0 ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5m0 4h.01" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                          <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <p
                    className={`mt-3 break-words text-xl font-black tracking-tight sm:text-2xl ${
                      due > 0 ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    {money(due)}
                  </p>
                </div>
              </div>

              {/* Payment progress */}
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    Payment progress
                  </span>
                  <span className="text-xs font-extrabold text-indigo-700">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label={`Payment progress for ${formatMonth(f.month)}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  className="h-2.5 overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      due === 0
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-400"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Payment history */}
              <div className="mt-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <path d="M4 5h16v14H4zM8 9h8M8 13h5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">
                        Payment history
                      </h3>
                      <p className="text-xs text-slate-500">
                        {f.payments.length} {f.payments.length === 1 ? "payment" : "payments"}
                      </p>
                    </div>
                  </div>
                </div>

                {f.payments.length > 0 ? (
                  <>
                    {/* Mobile payment cards */}
                    <div className="grid gap-3 sm:hidden">
                      {f.payments.map((p) => (
                        <div
                          key={p.receiptNo}
                          className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-indigo-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Payment date
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {formatDate(p.date)}
                              </p>
                            </div>
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-extrabold text-emerald-700">
                              {money(p.amount)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold capitalize text-slate-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                              {p.method}
                            </span>

                            <Link
                              href={`${receiptBase}/${f.feeId}-${p.receiptNo}`}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-100 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                                <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
                                <path d="M14 3v5h5M9 13h6M9 17h6" strokeLinecap="round" />
                              </svg>
                              Receipt
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tablet and desktop table */}
                    <div className="hidden sm:block">
                      <TableWrap>
                        <thead className="bg-slate-50/80">
                          <tr>
                            <th className="th">Payment date</th>
                            <th className="th">Amount</th>
                            <th className="th">Method</th>
                            <th className="th">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {f.payments.map((p) => (
                            <tr
                              key={p.receiptNo}
                              className="transition-colors hover:bg-indigo-50/30"
                            >
                              <td className="td whitespace-nowrap">
                                {formatDate(p.date)}
                              </td>
                              <td className="td font-bold text-emerald-700">
                                {money(p.amount)}
                              </td>
                              <td className="td">
                                <span className="inline-flex items-center gap-2 capitalize text-slate-600">
                                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                                  {p.method}
                                </span>
                              </td>
                              <td className="td">
                                <Link
                                  href={`${receiptBase}/${f.feeId}-${p.receiptNo}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-bold text-indigo-700 transition-all hover:bg-indigo-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                                    <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
                                    <path d="M14 3v5h5M9 13h6M9 17h6" strokeLinecap="round" />
                                  </svg>
                                  {p.receiptNo}
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </TableWrap>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                        <path d="M4 5h16v14H4zM8 9h8M8 13h5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      No payments recorded
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Payments for this month will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
