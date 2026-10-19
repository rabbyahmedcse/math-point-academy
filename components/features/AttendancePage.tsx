import { PageHeader, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { BatchFilter } from "./BatchFilter";
import { AttendanceSheet } from "./AttendanceSheet";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { formatDate, joinMonth, monthStr, pct, todayStr } from "@/lib/utils";
import { User } from "@/models/User";
import { Attendance } from "@/models/Attendance";

/** Mark attendance per batch/date, bulk mark present, review history and the monthly report. */
export default async function AttendancePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;
  await connectDB();
  const batches = await batchesFor(user);
  const batch = batches.find((b) => String(b._id) === sp.batch);
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) && sp.date <= todayStr() ? sp.date : todayStr();
  const month = date.slice(0, 7) || monthStr();

  let body: React.ReactNode = <Empty>Select a batch and date to take attendance.</Empty>;
  if (batch) {
    const students = await User.find({ role: "student", status: "active", batchId: batch._id }).sort({ name: 1 }).lean();
    const [today, monthDocs, recent] = await Promise.all([
      Attendance.findOne({ batchId: batch._id, date }).lean(),
      Attendance.find({ batchId: batch._id, date: { $regex: `^${month}` } }).lean(),
      Attendance.find({ batchId: batch._id }).sort({ date: -1 }).limit(10).lean(),
    ]);
    const prev = new Map((today?.records ?? []).map((r) => [String(r.studentId), r.status]));
    const sheet = students.map((s) => ({ id: String(s._id), name: s.name, studentId: s.studentId ?? "", status: prev.get(String(s._id)) ?? "present" }));

    const monthly = students.filter((s) => joinMonth(s.createdAt) <= month).map((s) => {
      let attended = 0, total = 0;
      for (const d of monthDocs) { const r = d.records.find((x) => String(x.studentId) === String(s._id)); if (r) { total++; if (r.status !== "absent") attended++; } }
      return { id: String(s._id), name: s.name, attended, total, percent: pct(attended, total) };
    });

    body = (
      <div className="space-y-8">
        <section>
          <h2 className="h2">{batch.name} — {formatDate(date)} {today && <span className="ml-2 align-middle"><Badge value="active" /> <span className="text-xs font-normal text-slate-500">already taken (editing keeps a history)</span></span>}</h2>
          {students.length === 0 ? <Empty>No active students in this batch yet.</Empty> : (
            <AttendanceSheet key={`${batch._id}-${date}`} batchId={String(batch._id)} date={date} students={sheet} existing={!!today} />
          )}
        </section>

        <section>
          <h2 className="h2">Recent sessions</h2>
          {recent.length === 0 ? <Empty>No attendance recorded yet.</Empty> : (
            <TableWrap>
              <thead className="bg-slate-50"><tr><th className="th">Date</th><th className="th">Present</th><th className="th">Late</th><th className="th">Absent</th><th className="th">Corrections</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((d) => (
                  <tr key={d.date}>
                    <td className="td"><a className="text-indigo-600 hover:underline" href={`?batch=${batch._id}&date=${d.date}`}>{formatDate(d.date)}</a></td>
                    <td className="td">{d.records.filter((r) => r.status === "present").length}</td>
                    <td className="td">{d.records.filter((r) => r.status === "late").length}</td>
                    <td className="td">{d.records.filter((r) => r.status === "absent").length}</td>
                    <td className="td text-xs text-slate-500">{d.history.length ? `${d.history.length} edit(s), last by ${d.history[d.history.length - 1].byName}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </section>

        <section>
          <h2 className="h2">Monthly report — {month}</h2>
          <TableWrap>
            <thead className="bg-slate-50"><tr><th className="th">Student</th><th className="th">Attended</th><th className="th">Sessions</th><th className="th">%</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {monthly.map((m) => (
                <tr key={m.id}><td className="td">{m.name}</td><td className="td">{m.attended}</td><td className="td">{m.total}</td>
                  <td className="td"><span className={m.total && m.percent < 75 ? "font-semibold text-red-600" : ""}>{m.total ? `${m.percent}%` : "—"}</span></td></tr>
              ))}
            </tbody>
          </TableWrap>
        </section>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Attendance" subtitle="Present, Absent or Late — per batch and date">
        <BatchFilter batches={batches} selected={sp.batch} label="Open">
          <label className="block"><span className="label">Date</span><input type="date" name="date" max={todayStr()} defaultValue={date} className="input" /></label>
        </BatchFilter>
      </PageHeader>
      {batches.length === 0 ? <Empty>You have no active batches yet.</Empty> : body}
    </>
  );
}

