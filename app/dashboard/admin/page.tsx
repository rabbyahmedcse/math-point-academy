import Link from "next/link";
import { PageHeader, StatCard, Empty } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { getAdminOverview } from "@/lib/stats";
import { formatMonth, formatTime, monthStr, money } from "@/lib/utils";

export default async function AdminDashboard() {
  const user = await requireRole(["admin"]);
  const o = await getAdminOverview();
  const attTotal = o.att.present + o.att.late + o.att.absent;
  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} subtitle={`Overview · ${formatMonth(monthStr())}`} />
      {o.pending > 0 && (
        <Link href="/dashboard/admin/students" className="mb-4 block rounded-lg bg-amber-50 p-3 text-sm text-amber-900 hover:bg-amber-100">
          ⏳ <b>{o.pending}</b> student registration{o.pending > 1 ? "s are" : " is"} waiting for approval →
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Students" value={o.students} tone="indigo" />
        <StatCard label="Teachers" value={o.teachers} />
        <StatCard label="Active batches" value={o.batches} />
        <StatCard label="Classes today" value={o.classes.length} />
        <StatCard label="Today's attendance" value={attTotal ? `${Math.round(((o.att.present + o.att.late) / attTotal) * 100)}%` : "—"} hint={`${o.att.present} present · ${o.att.late} late · ${o.att.absent} absent`} tone="green" />
        <StatCard label="Collected this month" value={money(o.collected)} tone="green" />
        <StatCard label="Due this month" value={money(o.due)} tone="red" />
        <StatCard label="Students with dues" value={o.unpaidStudents} tone="amber" />
      </div>
      <section className="mt-6">
        <h2 className="h2">Today&apos;s classes</h2>
        {o.classes.length === 0 ? <Empty>No classes scheduled today.</Empty> : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {o.classes.map((c) => (
              <li key={String(c._id)} className="flex flex-wrap justify-between gap-2 px-4 py-2 text-sm">
                <span><b>{c.subject}</b> · {c.batchName}</span>
                <span className={c.status === "cancelled" ? "text-red-600 line-through" : "text-slate-600"}>{formatTime(c.startTime)}–{formatTime(c.endTime)} {c.location && `· ${c.location}`}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
