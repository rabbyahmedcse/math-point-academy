import { PageHeader, StatCard, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { ChildPicker, NoChild } from "@/components/features/parent/ChildPicker";
import { requireRole } from "@/lib/session";
import { resolveChild } from "@/lib/parent-data";
import { studentAttendance } from "@/lib/stats";
import { formatDate, formatMonth, pct } from "@/lib/utils";

export default async function ParentAttendance({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["parent"]);
  const { children, child } = await resolveChild(user.id, (await searchParams).child);
  if (!child) return <NoChild parentId={user.id} />;

  const a = await studentAttendance(child.id);
  const count = (s: string) => a.rows.filter((r) => r.status === s).length;
  const byMonth = new Map<string, { present: number; late: number; absent: number }>();
  for (const r of a.rows) {
    const m = byMonth.get(r.date.slice(0, 7)) ?? { present: 0, late: 0, absent: 0 };
    m[r.status]++;
    byMonth.set(r.date.slice(0, 7), m);
  }

  return (
    <>
      <PageHeader title="Attendance" subtitle={`${child.name} · ${child.studentId} · late counts as attended`} />
      <ChildPicker kids={children} selectedId={child.id} basePath="/dashboard/parent/attendance" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${a.percent}%`} hint={`${a.attended} of ${a.total} classes`} tone={a.total && a.percent < 75 ? "red" : "green"} />
        <StatCard label="Present days" value={count("present")} tone="green" />
        <StatCard label="Late" value={count("late")} tone="amber" />
        <StatCard label="Absent days" value={count("absent")} tone="red" />
      </div>
      {a.rows.length === 0 ? <Empty>No attendance recorded yet.</Empty> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section><h2 className="h2">Month by month</h2>
            <TableWrap>
              <thead className="bg-slate-50"><tr><th className="th">Month</th><th className="th">Present</th><th className="th">Late</th><th className="th">Absent</th><th className="th">%</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {[...byMonth.entries()].map(([m, v]) => (
                  <tr key={m}><td className="td">{formatMonth(m)}</td><td className="td">{v.present}</td><td className="td">{v.late}</td><td className="td">{v.absent}</td><td className="td">{pct(v.present + v.late, v.present + v.late + v.absent)}%</td></tr>
                ))}
              </tbody>
            </TableWrap>
          </section>
          <section><h2 className="h2">Recent days</h2>
            <TableWrap>
              <thead className="bg-slate-50"><tr><th className="th">Date</th><th className="th">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{a.rows.slice(0, 20).map((r) => <tr key={r.date}><td className="td">{formatDate(r.date)}</td><td className="td"><Badge value={r.status} /></td></tr>)}</tbody>
            </TableWrap>
          </section>
        </div>
      )}
    </>
  );
}
