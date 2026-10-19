import { PageHeader, Empty, TableWrap } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { formatDate, formatTime, pct, todayStr } from "@/lib/utils";
import { Types } from "mongoose";
import { performanceOf } from "@/lib/performance";
import { Exam } from "@/models/Exam";

export default async function StudentResults() {
  const user = await requireRole(["student"]);
  await connectDB();
  // Schedule: upcoming exams for my batch. Results: ONLY published exams, ONLY my own row.
  const [upcoming, published] = await Promise.all([
    Exam.find({ batchId: user.batchId, status: "scheduled", date: { $gte: todayStr() } }).sort({ date: 1 }).lean(),
    Exam.find({ batchId: user.batchId, publishStatus: "published", status: "scheduled" }, { name: 1, subject: 1, date: 1, fullMarks: 1, results: { $elemMatch: { studentId: new Types.ObjectId(user.id) } } }).sort({ date: -1 }).lean(),
  ]);
  return (
    <>
      <PageHeader title="Exams & results" />
      <section className="mb-8"><h2 className="h2">Upcoming exams</h2>
        {upcoming.length === 0 ? <Empty>No upcoming exams.</Empty> : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {upcoming.map((e) => <li key={String(e._id)} className="flex justify-between px-4 py-2 text-sm"><span><b>{e.name}</b> · {e.subject}</span><span>{formatDate(e.date)} {formatTime(e.startTime)} · {e.fullMarks} marks</span></li>)}
          </ul>)}
      </section>
      <section><h2 className="h2">Published results</h2>
        {published.length === 0 ? <Empty>No results published yet.</Empty> : (
          <TableWrap>
            <thead className="bg-slate-50"><tr><th className="th">Exam</th><th className="th">Date</th><th className="th">Marks</th><th className="th">%</th><th className="th">Performance</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {published.map((e) => { const r = e.results[0]; return (
                <tr key={String(e._id)}><td className="td"><b>{e.name}</b><br /><span className="text-xs text-slate-500">{e.subject}</span></td><td className="td">{formatDate(e.date)}</td>
                  <td className="td">{r?.marks ?? "—"} / {e.fullMarks}</td><td className="td">{r?.marks != null ? `${pct(r.marks, e.fullMarks)}%` : "—"}</td><td className="td">{performanceOf(r?.performance) ? <span className={`badge ${performanceOf(r?.performance)!.cls}`}>{performanceOf(r?.performance)!.label}</span> : "—"}</td></tr>); })}
            </tbody>
          </TableWrap>)}
      </section>
    </>
  );
}
