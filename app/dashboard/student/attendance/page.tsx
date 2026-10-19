import { PageHeader, StatCard, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { studentAttendance } from "@/lib/stats";
import { formatDate } from "@/lib/utils";

/** Read-only: students can never write attendance. */
export default async function StudentAttendance() {
  const user = await requireRole(["student"]);
  await connectDB();
  const a = await studentAttendance(user.id);
  const count = (s: string) => a.rows.filter((r) => r.status === s).length;
  return (
    <>
      <PageHeader title="My attendance" subtitle="Late counts as attended" />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${a.percent}%`} tone={a.total && a.percent < 75 ? "red" : "green"} />
        <StatCard label="Present" value={count("present")} tone="green" />
        <StatCard label="Late" value={count("late")} tone="amber" />
        <StatCard label="Absent" value={count("absent")} tone="red" />
      </div>
      {a.rows.length === 0 ? <Empty>No attendance recorded yet.</Empty> : (
        <TableWrap>
          <thead className="bg-slate-50"><tr><th className="th">Date</th><th className="th">Status</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{a.rows.map((r) => <tr key={r.date}><td className="td">{formatDate(r.date)}</td><td className="td"><Badge value={r.status} /></td></tr>)}</tbody>
        </TableWrap>
      )}
    </>
  );
}
