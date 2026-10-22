
import Link from "next/link";
import type { ReactNode } from "react";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import {
  getFeeLedgerWithFees,
  getTotalDueAllMonths,
  type LedgerRow,
} from "@/lib/stats";
import {
  cn,
  formatDate,
  formatMonth,
  monthStr,
  money,
  todayStr,
} from "@/lib/utils";
import { PAYMENT_METHODS } from "@/models/Fee";
import {
  recordPayment,
  voidPayment,
  adjustAmountDue,
} from "@/actions/fees";
import { FeeDialog } from "./fees/FeeDialog";
import { AutoSelect } from "./fees/AutoSelect";
import {
  AlertIcon,
  CardIcon,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  ClockIcon,
  CoinsIcon,
  EyeIcon,
  FileIcon,
  InfoIcon,
  PieIcon,
  SearchIcon,
  UsersIcon,
  WalletIcon,
} from "./fees/FeeIcons";

const PAGE_SIZE = 10;

const AVATARS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
];

const avatarTone = (s: string) =>
  AVATARS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATARS.length];

function StatusPill({ status }: { status: LedgerRow["status"] }) {
  const map = {
    paid: {
      label: "Paid",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: <CheckIcon className="h-4 w-4" />,
    },
    partial: {
      label: "Partial",
      cls: "border-amber-200 bg-amber-50 text-amber-700",
      icon: <ClockIcon className="h-4 w-4" />,
    },
    due: {
      label: "Unpaid",
      cls: "border-rose-200 bg-rose-50 text-rose-700",
      icon: <AlertIcon className="h-4 w-4" />,
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold",
        map.cls
      )}
    >
      {map.icon}
      {map.label}
    </span>
  );
}

function Stat({
  icon,
  tone,
  label,
  hint,
  value,
  valueClass,
  info,
}: {
  icon: ReactNode;
  tone: string;
  label: string;
  hint: string;
  value: ReactNode;
  valueClass?: string;
  info: string;
}) {
  return (
    <div className="group relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/[0.07] sm:p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 -z-10 h-28 w-28 rounded-full bg-indigo-100/40 blur-2xl transition-transform duration-500 group-hover:scale-150"
      />

      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 sm:h-12 sm:w-12",
            tone
          )}
        >
          {icon}
        </div>

        <span
          title={info}
          className="cursor-help rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
          aria-label={info}
        >
          <InfoIcon className="h-4 w-4" />
        </span>
      </div>

      <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>

      <p
        className={cn(
          "mt-3 break-words text-2xl font-black tracking-tight sm:text-3xl",
          valueClass ?? "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Monthly fee ledger: total-due banner, stats, tabs, search, paginated table and payment dialogs. */
export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;

  await connectDB();

  const month =
    sp.month && /^\d{4}-\d{2}$/.test(sp.month)
      ? sp.month
      : monthStr();

  const batches = await batchesFor(user);
  const picked = batches.filter((b) => String(b._id) === sp.batch);
  const scope = picked.length ? picked : batches;
  const scopeIds = scope.map((b) => b._id);
  const canEnter = user.role === "admin" || user.permissions.feeEntry;
  const base = `/dashboard/${user.role}/fees`;

  // Keep the original ledger loading and all-month total calculation.
  const ledgerP = getFeeLedgerWithFees(month, scopeIds);

  const [{ rows: ledger, fees }, totalDue] = await Promise.all([
    ledgerP,
    getTotalDueAllMonths(
      scopeIds,
      month === monthStr() ? ledgerP.then((l) => l.rows) : undefined
    ),
  ]);

  const feeByStudent = new Map(
    fees.map((f) => [String(f.studentId), f])
  );

  // Selected-month statistics.
  const expected = ledger.reduce((s, r) => s + r.amountDue, 0);
  const collected = ledger.reduce((s, r) => s + r.paid, 0);
  const due = ledger.reduce((s, r) => s + r.due, 0);
  const unpaidStudents = ledger.filter((r) => r.status === "due").length;

  // Original search, filter, tab and pagination logic.
  const q = (sp.q ?? "").trim().toLowerCase();

  const filtered = ledger.filter(
    (r) =>
      (!sp.tb || r.batchId === sp.tb) &&
      (!q ||
        r.name.toLowerCase().includes(q) ||
        (r.studentCode ?? "").toLowerCase().includes(q))
  );

  const paidRows = filtered.filter((r) => r.status === "paid");
  const dueRows = filtered.filter((r) => r.status !== "paid");
  const tab =
    sp.tab === "paid" || sp.tab === "due" ? sp.tab : "all";

  const rows =
    tab === "paid" ? paidRows : tab === "due" ? dueRows : filtered;

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(Math.max(Number(sp.page) || 1, 1), pages);
  const visible = rows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const href = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();

    for (const [k, v] of Object.entries({ ...sp, ...o })) {
      if (v) p.set(k, v);
    }

    return `?${p.toString()}`;
  };

  const tabs = [
    {
      key: "all",
      label: "All Students",
      n: filtered.length,
      icon: null,
    },
    {
      key: "paid",
      label: "Paid",
      n: paidRows.length,
      icon: <CheckIcon className="h-4 w-4 text-emerald-600" />,
    },
    {
      key: "due",
      label: "Due / Partial",
      n: dueRows.length,
      icon: <ClockIcon className="h-4 w-4 text-rose-500" />,
    },
  ];

  const firstPage = Math.max(1, Math.min(page - 2, pages - 4));
  const pageNumbers = Array.from(
    { length: Math.min(5, pages) },
    (_, i) => firstPage + i
  );

  return (
    <main className="min-w-0 space-y-6 pb-8">
      {/* Page header */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50/70 p-5 shadow-[0_16px_50px_-35px_rgba(79,70,229,0.35)] sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full border-[24px] border-indigo-100/40"
        />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 hover:rotate-3 hover:scale-105 sm:h-14 sm:w-14">
              <WalletIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Finance management
              </span>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Fees & Payments
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                {formatMonth(month)} · Manage student fees, track collections
                and review outstanding balances.
              </p>
            </div>
          </div>

          <form className="grid min-w-0 gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur-md sm:grid-cols-2 xl:min-w-[410px]">
            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Batch
              </span>
              <select
                name="batch"
                defaultValue={sp.batch ?? ""}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">
                  {user.role === "admin" ? "All batches" : "All my batches"}
                </option>
                {batches.map((b) => (
                  <option key={String(b._id)} value={String(b._id)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Month
              </span>
              <input
                type="month"
                name="month"
                defaultValue={month}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>

            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/50 sm:col-span-2">
              <SearchIcon className="h-4 w-4" />
              Apply filters
            </button>
          </form>
        </div>
      </section>

      {!canEnter && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <span className="font-bold">View-only access.</span>{" "}
            Fee entry is not enabled for your account.
          </p>
        </div>
      )}

      {/* All-month outstanding total */}
      <section className="group relative isolate overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-br from-white via-rose-50 to-orange-50/70 p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/[0.08] sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 -z-10 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl transition-transform duration-500 group-hover:scale-125"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 sm:h-16 sm:w-16">
            <CoinsIcon className="h-8 w-8" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rose-700">
              Total outstanding · All months
            </p>
            <p className="mt-2 break-words text-3xl font-black tracking-tight text-rose-700 sm:text-4xl lg:text-5xl">
              {money(totalDue)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Total outstanding amount across all months. This amount remains
              visible when you change the selected month.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-white/80 bg-white/70 p-4 text-xs leading-5 text-slate-600 shadow-sm backdrop-blur-sm lg:max-w-64">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <p title="Months in which no fee record was ever created are not included.">
              Months without an existing fee record are not included in this
              total.
            </p>
          </div>
        </div>
      </section>

      {/* Monthly statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Monthly overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Financial summary for {formatMonth(month)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            icon={<FileIcon className="h-6 w-6" />}
            tone="bg-indigo-100 text-indigo-700"
            label="Expected"
            hint="Total fees for selected month"
            value={money(expected)}
            info="Sum of the monthly fee of every active student in scope."
          />
          <Stat
            icon={<WalletIcon className="h-6 w-6" />}
            tone="bg-emerald-100 text-emerald-700"
            label="Collected"
            hint="Payments collected this month"
            value={money(collected)}
            valueClass="text-emerald-700"
            info="Payments recorded for this month, excluding voided payments."
          />
          <Stat
            icon={<PieIcon className="h-6 w-6" />}
            tone="bg-rose-100 text-rose-700"
            label="Due"
            hint="Outstanding for selected month"
            value={money(due)}
            valueClass="text-rose-700"
            info="Expected fees minus collected payments for this month."
          />
          <Stat
            icon={<UsersIcon className="h-6 w-6" />}
            tone="bg-amber-100 text-amber-700"
            label="Unpaid students"
            hint="Students with no payment"
            value={unpaidStudents}
            valueClass="text-amber-700"
            info="Students who have not paid anything this month."
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white via-indigo-50/30 to-violet-50/30 p-4 sm:p-5">
          <h2 className="text-lg font-extrabold text-slate-900">
            Student fee ledger
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Find students, review balances and manage payment records.
          </p>
        </div>

        <div className="space-y-4 p-3 sm:p-5">
          <nav
            aria-label="Filter students by payment status"
            className="grid grid-cols-3 gap-2"
          >
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={href({
                  tab: t.key === "all" ? undefined : t.key,
                  page: undefined,
                })}
                aria-current={tab === t.key ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm",
                  tab === t.key
                    ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40"
                )}
              >
                {t.icon}
                <span>{t.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] sm:text-xs",
                    tab === t.key
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {t.n}
                </span>
              </Link>
            ))}
          </nav>

          {/* Search and batch filter */}
          <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_auto]">
            {sp.batch && (
              <input type="hidden" name="batch" value={sp.batch} />
            )}
            <input type="hidden" name="month" value={month} />
            {sp.tab && <input type="hidden" name="tab" value={sp.tab} />}

            <label className="relative block min-w-0">
              <span className="sr-only">Search student</span>
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={sp.q}
                placeholder="Search student name or ID..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-indigo-200 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>

            <label className="block min-w-0">
              <span className="sr-only">Filter by batch</span>
              <AutoSelect
                name="tb"
                defaultValue={sp.tb ?? ""}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition hover:border-indigo-200 hover:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">All batches</option>
                {scope.map((b) => (
                  <option key={String(b._id)} value={String(b._id)}>
                    {b.name}
                  </option>
                ))}
              </AutoSelect>
            </label>

            <button className="h-12 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/50 sm:col-span-2 xl:col-span-1">
              Search
            </button>
          </form>
        </div>

        {/* Mobile student cards */}
        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/50 p-3 sm:p-5 lg:hidden">
          {visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <SearchIcon className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm font-bold text-slate-800">
                {ledger.length === 0
                  ? "No active students in these batches yet."
                  : "No students match your filters."}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}

          {visible.map((r) => {
            const f = feeByStudent.get(r.studentId);
            const payments = f?.payments ?? [];
            const canPay = canEnter && r.due > 0;

            return (
              <article
                key={r.studentId}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/[0.06]"
              >
                <div className="flex items-start gap-3 p-4">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black shadow-sm",
                      avatarTone(r.name)
                    )}
                  >
                    {r.name.trim().charAt(0).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="break-words font-extrabold text-slate-900">
                      {r.name}
                    </p>
                    <p className="mt-0.5 break-words text-xs text-slate-500">
                      {r.studentCode || "No student ID"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-indigo-600">
                      {r.batchName}
                    </p>
                  </div>

                  <StatusPill status={r.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 px-3 pb-4 sm:px-4">
                  <div className="min-w-0 rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Fee
                    </p>
                    <p className="mt-1 break-words text-sm font-extrabold text-slate-800">
                      {money(r.amountDue)}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-xl bg-emerald-50 p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Paid
                    </p>
                    <p className="mt-1 break-words text-sm font-extrabold text-emerald-700">
                      {money(r.paid)}
                    </p>
                  </div>

                  <div className={cn("min-w-0 rounded-xl p-2.5", r.due > 0 ? "bg-rose-50" : "bg-slate-50")}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Due
                    </p>
                    <p className={cn("mt-1 break-words text-sm font-extrabold", r.due > 0 ? "text-rose-700" : "text-slate-800")}>
                      {money(r.due)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-gradient-to-r from-white to-indigo-50/40 p-3">
                  <FeeDialog
                    label={canPay ? "Record Payment" : "View details"}
                    variant={canPay ? "primary" : "outline"}
                    icon={
                      canPay ? (
                        <CardIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )
                    }
                    title={r.name}
                    subtitle={`${r.studentCode ?? ""} • ${r.batchName} • ${formatMonth(month)}`}
                  >
                    <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                        <p className="text-xs text-slate-500">Fee</p>
                        <p className="break-words font-bold">{money(r.amountDue)}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2.5">
                        <p className="text-xs text-slate-500">Paid</p>
                        <p className="break-words font-bold text-emerald-700">{money(r.paid)}</p>
                      </div>
                      <div className="rounded-xl border border-rose-100 bg-rose-50 p-2.5">
                        <p className="text-xs text-slate-500">Due</p>
                        <p className="break-words font-bold text-rose-700">{money(r.due)}</p>
                      </div>
                    </div>

                    {canPay && (
                      <ActionForm
                        action={recordPayment}
                        submitLabel="Record payment"
                        submitClassName="btn bg-indigo-600 text-white hover:bg-indigo-700"
                        className="mb-5 space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4"
                      >
                        <input type="hidden" name="studentId" value={r.studentId} />
                        <input type="hidden" name="month" value={month} />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Field label="Amount (৳)">
                            <input name="amount" type="number" min={1} max={r.due} defaultValue={r.due} required className="input w-full" />
                          </Field>
                          <Field label="Date">
                            <input name="date" type="date" max={todayStr()} defaultValue={todayStr()} required className="input w-full" />
                          </Field>
                        </div>

                        <Field label="Method">
                          <select name="method" className="input w-full capitalize">
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Note (optional)">
                          <input name="note" placeholder="Add a payment note..." className="input w-full" />
                        </Field>
                      </ActionForm>
                    )}

                    <h4 className="mb-3 text-sm font-extrabold text-slate-800">
                      Payment history
                    </h4>

                    {payments.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                        No payments recorded for this month.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {payments.map((p) => (
                          <li
                            key={p.receiptNo}
                            className={cn(
                              "rounded-xl border border-slate-200 bg-white p-3",
                              p.voided && "bg-slate-50 text-slate-400"
                            )}
                          >
                            <div className={cn("flex flex-wrap items-center justify-between gap-2", p.voided && "line-through")}>
                              <span className="font-bold">
                                {money(p.amount)} · <span className="capitalize">{p.method}</span>
                              </span>
                              <span className="text-xs text-slate-500">{formatDate(p.date)}</span>
                            </div>

                            {p.voided ? (
                              <p className="mt-2 text-xs">Voided: {p.voidReason}</p>
                            ) : (
                              <Link
                                className="mt-2 inline-flex text-xs font-bold text-indigo-600 hover:underline"
                                href={`${base}/receipt/${f!._id}-${p.receiptNo}`}
                              >
                                View receipt {p.receiptNo}
                              </Link>
                            )}

                            {user.role === "admin" && !p.voided && (
                              <ActionForm
                                action={voidPayment}
                                submitLabel="Void payment"
                                submitClassName="btn btn-danger btn-sm"
                                className="mt-3 space-y-2"
                              >
                                <input type="hidden" name="feeId" value={String(f!._id)} />
                                <input type="hidden" name="receiptNo" value={p.receiptNo} />
                                <input name="reason" required placeholder="Reason to void" className="input w-full text-xs" />
                              </ActionForm>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {user.role === "admin" && (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <ActionForm
                          action={adjustAmountDue}
                          submitLabel="Adjust amount"
                          submitClassName="btn btn-secondary btn-sm"
                          resetOnSuccess={false}
                          className="space-y-3"
                        >
                          <input type="hidden" name="studentId" value={r.studentId} />
                          <input type="hidden" name="month" value={month} />
                          <Field label="Amount due for this month (discount / correction)">
                            <input name="amountDue" type="number" min={0} defaultValue={r.amountDue} className="input w-full" />
                          </Field>
                        </ActionForm>
                      </div>
                    )}
                  </FeeDialog>
                </div>
              </article>
            );
          })}
        </div>

        {/* Desktop / large tablet table. Only one copy of each interactive form is rendered at a time. */}
        <div className="hidden overflow-x-auto border-t border-slate-100 lg:block">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-50/80">
              <tr>
                {["Student", "Batch", "Fee", "Paid", "Due", "Status", "Action"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-sm font-bold text-slate-700">
                      {ledger.length === 0
                        ? "No active students in these batches yet."
                        : "No students match your filters."}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}

              {visible.map((r) => {
                const f = feeByStudent.get(r.studentId);
                const payments = f?.payments ?? [];
                const canPay = canEnter && r.due > 0;

                return (
                  <tr
                    key={r.studentId}
                    className="transition-colors duration-200 hover:bg-indigo-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black shadow-sm", avatarTone(r.name))}>
                          {r.name.trim().charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{r.studentCode}</p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-600">{r.batchName}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">{money(r.amountDue)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-emerald-700">{money(r.paid)}</td>
                    <td className={cn("whitespace-nowrap px-5 py-4 text-sm font-bold", r.due > 0 ? "text-rose-700" : "text-slate-700")}>{money(r.due)}</td>
                    <td className="px-5 py-4"><StatusPill status={r.status} /></td>

                    <td className="px-5 py-4">
                      <FeeDialog
                        label={canPay ? "Record payment" : "View details"}
                        variant={canPay ? "primary" : "outline"}
                        icon={canPay ? <CardIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        title={r.name}
                        subtitle={`${r.studentCode ?? ""} • ${r.batchName} • ${formatMonth(month)}`}
                      >
                        <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Fee</p>
                            <p className="font-bold">{money(r.amountDue)}</p>
                          </div>
                          <div className="rounded-xl bg-emerald-50 p-3">
                            <p className="text-xs text-slate-500">Paid</p>
                            <p className="font-bold text-emerald-700">{money(r.paid)}</p>
                          </div>
                          <div className="rounded-xl bg-rose-50 p-3">
                            <p className="text-xs text-slate-500">Due</p>
                            <p className="font-bold text-rose-700">{money(r.due)}</p>
                          </div>
                        </div>

                        {canPay && (
                          <ActionForm
                            action={recordPayment}
                            submitLabel="Record payment"
                            submitClassName="btn bg-indigo-600 text-white hover:bg-indigo-700"
                            className="mb-5 space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4"
                          >
                            <input type="hidden" name="studentId" value={r.studentId} />
                            <input type="hidden" name="month" value={month} />
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Amount (৳)">
                                <input name="amount" type="number" min={1} max={r.due} defaultValue={r.due} required className="input w-full" />
                              </Field>
                              <Field label="Date">
                                <input name="date" type="date" max={todayStr()} defaultValue={todayStr()} required className="input w-full" />
                              </Field>
                            </div>
                            <Field label="Method">
                              <select name="method" className="input w-full capitalize">
                                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </Field>
                            <Field label="Note (optional)">
                              <input name="note" placeholder="Add a payment note..." className="input w-full" />
                            </Field>
                          </ActionForm>
                        )}

                        <h4 className="mb-3 text-sm font-extrabold text-slate-800">Payment history</h4>

                        {payments.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                            No payments recorded for this month.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {payments.map((p) => (
                              <li key={p.receiptNo} className={cn("rounded-xl border border-slate-200 p-3 text-sm", p.voided && "bg-slate-50 text-slate-400")}>
                                <div className={cn("flex flex-wrap items-center justify-between gap-2", p.voided && "line-through")}>
                                  <span className="font-bold">{money(p.amount)} · <span className="capitalize">{p.method}</span></span>
                                  <span className="text-xs">{formatDate(p.date)}</span>
                                </div>
                                {p.voided ? (
                                  <p className="mt-2 text-xs">Voided: {p.voidReason}</p>
                                ) : (
                                  <Link className="mt-2 inline-flex text-xs font-bold text-indigo-600 hover:underline" href={`${base}/receipt/${f!._id}-${p.receiptNo}`}>
                                    View receipt {p.receiptNo}
                                  </Link>
                                )}
                                {user.role === "admin" && !p.voided && (
                                  <ActionForm action={voidPayment} submitLabel="Void payment" submitClassName="btn btn-danger btn-sm" className="mt-3 space-y-2">
                                    <input type="hidden" name="feeId" value={String(f!._id)} />
                                    <input type="hidden" name="receiptNo" value={p.receiptNo} />
                                    <input name="reason" required placeholder="Reason to void" className="input w-full text-xs" />
                                  </ActionForm>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {user.role === "admin" && (
                          <div className="mt-5 border-t border-slate-100 pt-4">
                            <ActionForm action={adjustAmountDue} submitLabel="Adjust amount" submitClassName="btn btn-secondary btn-sm" resetOnSuccess={false} className="space-y-3">
                              <input type="hidden" name="studentId" value={r.studentId} />
                              <input type="hidden" name="month" value={month} />
                              <Field label="Amount due for this month (discount / correction)">
                                <input name="amountDue" type="number" min={0} defaultValue={r.amountDue} className="input w-full" />
                              </Field>
                            </ActionForm>
                          </div>
                        )}
                      </FeeDialog>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Result count and pagination */}
        <footer className="flex flex-col gap-4 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs leading-5 text-slate-500 sm:text-sm">
            Showing{" "}
            {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            {"–"}
            {(page - 1) * PAGE_SIZE + visible.length} of {rows.length} students
            {tab !== "all" &&
              ` (${tab === "paid" ? "Paid" : "Due / Partial"})`}
          </p>

          {pages > 1 && (
            <nav
              className="flex flex-wrap items-center gap-1.5"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  aria-label="Previous page"
                  href={href({ page: String(page - 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 text-slate-300">
                  <ChevronLeft className="h-4 w-4" />
                </span>
              )}

              {pageNumbers.map((n) => (
                <Link
                  key={n}
                  href={href({ page: String(n) })}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(
                    "flex h-10 min-w-10 items-center justify-center rounded-xl border px-2 text-sm font-bold transition-all",
                    n === page
                      ? "border-indigo-600 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                      : "border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  )}
                >
                  {n}
                </Link>
              ))}

              {page < pages ? (
                <Link
                  aria-label="Next page"
                  href={href({ page: String(page + 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          )}
        </footer>
      </section>
    </main>
  );
}
