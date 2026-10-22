
import { notFound } from "next/navigation";
import { PrintButton } from "./PrintButton";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { formatDate, formatMonth, money } from "@/lib/utils";
import { Fee } from "@/models/Fee";
import { User } from "@/models/User";
import { Batch } from "@/models/Batch";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import { Types } from "mongoose";
import { ParentLink } from "@/models/ParentLink";

/** Printable receipt. Students/parents can only open their own; teachers only for batches they manage. */
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const user = await requireRole(["admin", "teacher", "student", "parent"]);
  const { ref } = await params;

  const [feeId, receiptNo] = decodeURIComponent(ref)
    .split("-RCT-")
    .map((v, i) => (i ? `RCT-${v}` : v));

  if (!feeId || !Types.ObjectId.isValid(feeId) || !receiptNo) notFound();

  await connectDB();

  const fee = await Fee.findById(feeId).lean();
  const p = fee?.payments.find(
    (x) => x.receiptNo === receiptNo && !x.voided,
  );

  if (!fee || !p) notFound();

  if (user.role === "student" && String(fee.studentId) !== user.id) {
    notFound();
  }

  if (
    user.role === "parent" &&
    !(await ParentLink.exists({
      parentId: user.id,
      studentId: fee.studentId,
      status: "active",
    }))
  ) {
    notFound();
  }

  const batch = await Batch.findById(fee.batchId).lean();

  if (
    user.role === "teacher" &&
    !batch?.teacherIds.some((t) => String(t) === user.id)
  ) {
    notFound();
  }

  const [student, s] = await Promise.all([
    User.findById(fee.studentId).lean(),
    Settings.findById("main").lean(),
  ]);

  const balance = Math.max(fee.amountDue - fee.paidTotal, 0);

  return (
    <main className="mx-auto min-w-0 max-w-3xl pb-10">
      {/* Screen heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Payment records
          </span>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Payment Receipt
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View, print or save a copy of this payment receipt.
          </p>
        </div>

        <div className="self-start rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>

            <div>
              <p className="text-xs font-semibold text-emerald-700">
                Payment recorded
              </p>
              <p className="text-[11px] text-emerald-600">
                Receipt verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt */}
      <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.06] print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
        {/* Decorative top strip */}
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 print:bg-indigo-600" />

        <div className="p-5 sm:p-8 md:p-10 print:p-4">
          {/* Receipt header */}
          <header className="border-b border-dashed border-slate-200 pb-6 sm:pb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 print:bg-indigo-600 print:shadow-none">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path d="M4 5h16v14H4z" />
                    <path d="M8 9h8M8 13h5" />
                    <path d="m14 16 2 2 4-4" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {s?.coachingName ?? SITE.name}
                  </h2>

                  {s?.address && (
                    <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500 sm:text-sm">
                      {s.address}
                    </p>
                  )}

                  <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-600">
                    Official payment receipt
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 sm:min-w-40 print:border-slate-300 print:bg-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Receipt number
                </p>
                <p className="mt-1 break-all text-base font-black text-indigo-700 print:text-slate-900">
                  {p.receiptNo}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(p.date)}
                </p>
              </div>
            </div>
          </header>

          {/* Student information */}
          <section className="py-6 sm:py-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-indigo-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Student information
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="Student name"
                value={student?.name ?? "—"}
              />
              <InfoItem
                label="Student ID"
                value={student?.studentId ?? "—"}
              />
              <InfoItem
                label="Batch"
                value={batch?.name ?? "—"}
              />
              <InfoItem
                label="Fee month"
                value={formatMonth(fee.month)}
              />
            </div>
          </section>

          {/* Payment information */}
          <section className="border-t border-slate-100 py-6 sm:py-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-violet-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Payment information
              </h3>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-xs font-medium text-slate-500">
                  Payment method
                </span>
                <span className="text-sm font-bold capitalize text-slate-800">
                  {p.method}
                </span>
              </div>

              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-xs font-medium text-slate-500">
                  Received by
                </span>
                <span className="break-words text-sm font-semibold text-slate-800">
                  {p.enteredByName}
                </span>
              </div>
            </div>
          </section>

          {/* Amount summary */}
          <section className="border-t border-dashed border-slate-200 py-6 sm:py-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-indigo-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Fee summary
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <AmountCard
                label="Monthly fee"
                amount={money(fee.amountDue)}
                tone="slate"
              />
              <AmountCard
                label="Total paid"
                amount={money(fee.paidTotal)}
                tone="indigo"
              />
              <AmountCard
                label="Remaining due"
                amount={money(balance)}
                tone={balance > 0 ? "amber" : "emerald"}
              />
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-500/20 print:border print:border-slate-300 print:bg-white print:text-slate-900 print:shadow-none">
              <p className="text-xs font-semibold text-indigo-100 print:text-slate-500">
                Amount received in this transaction
              </p>

              <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                <p className="text-3xl font-black tracking-tight sm:text-4xl">
                  {money(p.amount)}
                </p>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white print:border-slate-300 print:text-slate-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                  Payment received
                </span>
              </div>
            </div>
          </section>

          {/* Receipt footer */}
          <footer className="border-t border-dashed border-slate-200 pt-5 sm:pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Thank you for your payment.
                </p>
                <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Please keep this receipt for your records. Contact the
                  coaching administration if you have any questions about
                  this payment.
                </p>
              </div>

              <div className="sm:text-right">
                <div className="mb-2 h-px w-40 bg-slate-300 sm:ml-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Authorized signature
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-[10px] font-medium tracking-wide text-slate-400">
              COMPUTER-GENERATED RECEIPT
            </p>
          </footer>
        </div>
      </article>

      {/* Print action */}
      <div className="mt-5 flex justify-center print:hidden">
        <PrintButton />
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: #fff !important;
            color: #0f172a !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          main {
            max-width: none !important;
            padding: 0 !important;
          }

          article {
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 transition-colors duration-200 hover:border-indigo-100 hover:bg-indigo-50/40 print:bg-white">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold leading-5 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function AmountCard({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: string;
  tone: "slate" | "indigo" | "amber" | "emerald";
}) {
  const styles = {
    slate: "border-slate-200 bg-slate-50/80 text-slate-800",
    indigo: "border-indigo-100 bg-indigo-50/70 text-indigo-700",
    amber: "border-amber-200 bg-amber-50/80 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50/80 text-emerald-700",
  };

  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 transition-transform duration-200 hover:-translate-y-0.5 print:bg-white ${styles[tone]}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-75">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-black tracking-tight sm:text-xl">
        {amount}
      </p>
    </div>
  );
}
