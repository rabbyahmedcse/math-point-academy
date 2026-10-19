import Link from "next/link";
import type { ReactNode } from "react";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { getFeeLedger, getTotalDueAllMonths, type LedgerRow } from "@/lib/stats";
import { cn, formatDate, formatMonth, monthStr, money, todayStr } from "@/lib/utils";
import { PAYMENT_METHODS, Fee } from "@/models/Fee";
import { recordPayment, voidPayment, adjustAmountDue } from "@/actions/fees";
import { FeeDialog } from "./fees/FeeDialog";
import { AutoSelect } from "./fees/AutoSelect";
import {
  AlertIcon, CardIcon, CheckIcon, ChevronLeft, ChevronRight, ClockIcon, CoinsIcon, EyeIcon, FileIcon, InfoIcon, PieIcon, SearchIcon, UsersIcon, WalletIcon,
} from "./fees/FeeIcons";

const PAGE_SIZE = 10;
const AVATARS = ["bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-cyan-100 text-cyan-700"];
const avatarTone = (s: string) => AVATARS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATARS.length];

function StatusPill({ status }: { status: LedgerRow["status"] }) {
  const map = {
    paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700", icon: <CheckIcon className="h-4 w-4" /> },
    partial: { label: "Partial", cls: "bg-amber-100 text-amber-700", icon: <ClockIcon className="h-4 w-4" /> },
    due: { label: "Unpaid", cls: "bg-red-100 text-red-700", icon: <AlertIcon className="h-4 w-4" /> },
  }[status];
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", map.cls)}>{map.icon}{map.label}</span>;
}

function Stat({ icon, tone, label, hint, value, valueClass, info }: { icon: ReactNode; tone: string; label: string; hint: string; value: ReactNode; valueClass?: string; info: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tone)}>{icon}</span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
          {label}<span title={info} className="cursor-help text-slate-400"><InfoIcon className="h-3.5 w-3.5" /></span>
        </p>
        <p className="text-xs text-slate-500">{hint}</p>
        <p className={cn("mt-1 text-3xl font-bold", valueClass ?? "text-slate-900")}>{value}</p>
      </div>
    </div>
  );
}

/** Monthly fee ledger: total-due banner, stats, tabs, search, paginated table and payment dialogs. */
export default async function FeesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;
  await connectDB();

  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : monthStr();
  const batches = await batchesFor(user);
  const picked = batches.filter((b) => String(b._id) === sp.batch);
  const scope = picked.length ? picked : batches;
  const scopeIds = scope.map((b) => b._id);
  const canEnter = user.role === "admin" || user.permissions.feeEntry;
  const base = `/dashboard/${user.role}/fees`;

  const [ledger, totalDue] = await Promise.all([getFeeLedger(month, scopeIds), getTotalDueAllMonths(scopeIds)]);
  const fees = await Fee.find({ month, studentId: { $in: ledger.map((r) => r.studentId) } }).lean();
  const feeByStudent = new Map(fees.map((f) => [String(f.studentId), f]));

  // --- stats (scoped by the top Batch + Month selector) ---
  const expected = ledger.reduce((s, r) => s + r.amountDue, 0);
  const collected = ledger.reduce((s, r) => s + r.paid, 0);
  const due = ledger.reduce((s, r) => s + r.due, 0);
  const unpaidStudents = ledger.filter((r) => r.status === "due").length;

  // --- table: search + batch filter, then tab, then page ---
  const q = (sp.q ?? "").trim().toLowerCase();
  const filtered = ledger.filter(
    (r) => (!sp.tb || r.batchId === sp.tb) && (!q || r.name.toLowerCase().includes(q) || (r.studentCode ?? "").toLowerCase().includes(q)),
  );
  const paidRows = filtered.filter((r) => r.status === "paid");
  const dueRows = filtered.filter((r) => r.status !== "paid");
  const tab = sp.tab === "paid" || sp.tab === "due" ? sp.tab : "all";
  const rows = tab === "paid" ? paidRows : tab === "due" ? dueRows : filtered;
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(Math.max(Number(sp.page) || 1, 1), pages);
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const href = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...o })) if (v) p.set(k, v);
    return `?${p.toString()}`;
  };
  const tabs = [
    { key: "all", label: "All Students", n: filtered.length, icon: null },
    { key: "paid", label: "Paid", n: paidRows.length, icon: <CheckIcon className="h-5 w-5 text-emerald-600" /> },
    { key: "due", label: "Due / Partial", n: dueRows.length, icon: <ClockIcon className="h-5 w-5 text-red-500" /> },
  ];
  const firstPage = Math.max(1, Math.min(page - 2, pages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, pages) }, (_, i) => firstPage + i);

  return (
    <>
      {/* Header + batch / month selectors */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Fees</h1>
          <p className="mt-1 text-slate-500">{formatMonth(month)} • Manage and track monthly fees</p>
        </div>
        <form className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Batch</span>
            <select name="batch" defaultValue={sp.batch ?? ""} className="h-11 min-w-48 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">{user.role === "admin" ? "All batches" : "All my batches"}</option>
              {batches.map((b) => <option key={String(b._id)} value={String(b._id)}>{b.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Month</span>
            <input type="month" name="month" defaultValue={month} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
          </label>
          <button className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700">Show</button>
        </form>
      </div>

      {!canEnter && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Fee entry is not enabled for your account — view only.</p>}

      {/* Total due across ALL months — independent of the month selector */}
      <div className="mb-5 flex flex-wrap items-center gap-5 rounded-2xl border border-red-200 bg-red-50 p-5">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"><CoinsIcon className="h-8 w-8" /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Total due • All months</p>
          <p className="text-4xl font-bold text-red-600">{money(totalDue)}</p>
        </div>
        <div className="hidden h-14 w-px bg-red-200 md:block" />
        <div className="flex min-w-60 flex-1 items-start gap-2 text-sm text-slate-700">
          <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p>This is the total outstanding amount across all months.</p>
            <p className="text-slate-500" title="Months in which no fee record was ever created are not included.">It will always be visible, even when you change the month.</p>
          </div>
        </div>
      </div>

      {/* Stat cards (selected month) */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<FileIcon className="h-6 w-6" />} tone="bg-blue-100 text-blue-600" label="Expected" hint="Total fee for selected month" value={money(expected)} info="Sum of the monthly fee of every active student in scope." />
        <Stat icon={<WalletIcon className="h-6 w-6" />} tone="bg-emerald-100 text-emerald-600" label="Collected" hint="Total collected for selected month" value={money(collected)} valueClass="text-emerald-600" info="Payments recorded for this month (voided payments excluded)." />
        <Stat icon={<PieIcon className="h-6 w-6" />} tone="bg-red-100 text-red-600" label="Due" hint="Outstanding for selected month" value={money(due)} valueClass="text-red-600" info="Expected minus collected for this month." />
        <Stat icon={<UsersIcon className="h-6 w-6" />} tone="bg-orange-100 text-orange-600" label="Unpaid students" hint="Students with no payment" value={unpaidStudents} valueClass="text-orange-600" info="Students who have not paid anything this month." />
      </div>

      {/* Tabs + search + batch filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
          {tabs.map((t) => (
            <Link key={t.key} href={href({ tab: t.key === "all" ? undefined : t.key, page: undefined })}
              className={cn("flex items-center gap-2 border-r border-slate-200 px-4 py-3 text-sm font-semibold last:border-r-0",
                tab === t.key ? "bg-blue-50 text-blue-700 ring-2 ring-inset ring-blue-500" : "text-slate-600 hover:bg-slate-50")}>
              {t.icon}{t.label} ({t.n})
            </Link>
          ))}
        </div>
        <form className="flex flex-wrap items-center gap-3">
          {sp.batch && <input type="hidden" name="batch" value={sp.batch} />}
          <input type="hidden" name="month" value={month} />
          {sp.tab && <input type="hidden" name="tab" value={sp.tab} />}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input name="q" defaultValue={sp.q} placeholder="Search student name or ID…" className="h-11 w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <AutoSelect name="tb" defaultValue={sp.tb ?? ""} className="h-11 min-w-40 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All batches</option>
            {scope.map((b) => <option key={String(b._id)} value={String(b._id)}>{b.name}</option>)}
          </AutoSelect>
          <button className="sr-only">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden surface">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                {["Student", "Batch", "Fee", "Paid", "Due", "Status", "Action"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">{ledger.length === 0 ? "No active students in these batches yet." : "No students match your filters."}</td></tr>
              )}
              {visible.map((r) => {
                const f = feeByStudent.get(r.studentId);
                const payments = f?.payments ?? [];
                const canPay = canEnter && r.due > 0;
                return (
                  <tr key={r.studentId} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold", avatarTone(r.name))}>{r.name.trim().charAt(0).toUpperCase()}</span>
                        <div><p className="font-semibold text-slate-900">{r.name}</p><p className="text-sm text-slate-500">{r.studentCode}</p></div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">{r.batchName}</td>
                    <td className="px-5 py-4 text-slate-700">{money(r.amountDue)}</td>
                    <td className="px-5 py-4 font-medium text-emerald-600">{money(r.paid)}</td>
                    <td className={cn("px-5 py-4 font-medium", r.due > 0 ? "text-red-600" : "text-slate-700")}>{money(r.due)}</td>
                    <td className="px-5 py-4"><StatusPill status={r.status} /></td>
                    <td className="px-5 py-4">
                      <FeeDialog
                        label={canPay ? "Record Payment" : "Open"}
                        variant={canPay ? "primary" : "outline"}
                        icon={canPay ? <CardIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        title={r.name}
                        subtitle={`${r.studentCode ?? ""} • ${r.batchName} • ${formatMonth(month)}`}
                      >
                        <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="rounded-lg bg-slate-50 p-2"><p className="text-xs text-slate-500">Fee</p><p className="font-semibold">{money(r.amountDue)}</p></div>
                          <div className="rounded-lg bg-emerald-50 p-2"><p className="text-xs text-slate-500">Paid</p><p className="font-semibold text-emerald-600">{money(r.paid)}</p></div>
                          <div className="rounded-lg bg-red-50 p-2"><p className="text-xs text-slate-500">Due</p><p className="font-semibold text-red-600">{money(r.due)}</p></div>
                        </div>

                        {canPay && (
                          <ActionForm action={recordPayment} submitLabel="Record payment" submitClassName="btn bg-blue-600 text-white hover:bg-blue-700" className="mb-5 space-y-2">
                            <input type="hidden" name="studentId" value={r.studentId} />
                            <input type="hidden" name="month" value={month} />
                            <div className="grid grid-cols-2 gap-2">
                              <Field label="Amount (৳)"><input name="amount" type="number" min={1} max={r.due} defaultValue={r.due} required className="input" /></Field>
                              <Field label="Date"><input name="date" type="date" max={todayStr()} defaultValue={todayStr()} required className="input" /></Field>
                            </div>
                            <Field label="Method"><select name="method" className="input capitalize">{PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
                            <input name="note" placeholder="Note (optional)" className="input" />
                          </ActionForm>
                        )}

                        <h4 className="mb-2 text-sm font-semibold text-slate-700">Payment history</h4>
                        {payments.length === 0 ? <p className="text-sm text-slate-500">No payments recorded for this month.</p> : (
                          <ul className="space-y-2 text-sm">
                            {payments.map((p) => (
                              <li key={p.receiptNo} className={cn("rounded-lg border p-3", p.voided && "bg-slate-50 text-slate-400")}>
                                <div className={cn("flex flex-wrap items-center justify-between gap-2", p.voided && "line-through")}>
                                  <span className="font-medium">{money(p.amount)} · <span className="capitalize">{p.method}</span></span>
                                  <span className="text-xs">{formatDate(p.date)}</span>
                                </div>
                                {p.voided ? <p className="mt-1 text-xs">Voided: {p.voidReason}</p> : (
                                  <Link className="text-xs font-medium text-blue-600 hover:underline" href={`${base}/receipt/${f!._id}-${p.receiptNo}`}>View receipt {p.receiptNo}</Link>
                                )}
                                {user.role === "admin" && !p.voided && (
                                  <ActionForm action={voidPayment} submitLabel="Void" submitClassName="btn btn-danger btn-sm" className="mt-2 flex items-center gap-2">
                                    <input type="hidden" name="feeId" value={String(f!._id)} /><input type="hidden" name="receiptNo" value={p.receiptNo} />
                                    <input name="reason" required placeholder="Reason to void" className="input !py-1 text-xs" />
                                  </ActionForm>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {user.role === "admin" && (
                          <div className="mt-5 border-t pt-4">
                            <ActionForm action={adjustAmountDue} submitLabel="Adjust" submitClassName="btn btn-secondary btn-sm" resetOnSuccess={false} className="flex items-end gap-2">
                              <input type="hidden" name="studentId" value={r.studentId} /><input type="hidden" name="month" value={month} />
                              <Field label="Amount due for this month (discount / correction)" className="grow"><input name="amountDue" type="number" min={0} defaultValue={r.amountDue} className="input" /></Field>
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

        {/* Footer: count + pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          <p>
            Showing {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + visible.length} of {rows.length} students
            {tab !== "all" && ` (${tab === "paid" ? "Paid" : "Due / Partial"})`}
          </p>
          {pages > 1 && (
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
              {page > 1 ? <Link aria-label="Previous page" href={href({ page: String(page - 1) })} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></Link>
                : <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 text-slate-300"><ChevronLeft className="h-4 w-4" /></span>}
              {pageNumbers.map((n) => (
                <Link key={n} href={href({ page: String(n) })} aria-current={n === page ? "page" : undefined}
                  className={cn("flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium", n === page ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{n}</Link>
              ))}
              {page < pages ? <Link aria-label="Next page" href={href({ page: String(page + 1) })} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></Link>
                : <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 text-slate-300"><ChevronRight className="h-4 w-4" /></span>}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
