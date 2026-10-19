import { Types } from "mongoose";
import { PageHeader, Empty, TableWrap, StatCard } from "@/components/ui/bits";
import { ChildPicker, NoChild } from "@/components/features/parent/ChildPicker";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { resolveChild } from "@/lib/parent-data";
import { performanceOf } from "@/lib/performance";
import { formatDate, pct } from "@/lib/utils";
import { Exam } from "@/models/Exam";

/** Published results only, and only the linked child's own marks. */
export default async function ParentResults({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["parent"]);
  const { children, child } = await resolveChild(user.id, (await searchParams).child);
  if (!child) return <NoChild parentId={user.id} />;
  await connectDB();

  const exams = child.batchId
    ? await Exam.find({ batchId: child.batchId, publishStatus: "published", status: "scheduled" },
        { name: 1, subject: 1, date: 1, fullMarks: 1, results: { $elemMatch: { studentId: new Types.ObjectId(child.id) } } }).sort({ date: -1 }).lean()
    : [];
  const graded = exams.filter((e) => e.results[0]?.marks != null);

  // subject-wise average
  const bySubject = new Map<string, { sum: number; n: number }>();
  for (const e of graded) {
    const s = bySubject.get(e.subject) ?? { sum: 0, n: 0 };
    s.sum += pct(e.results[0].marks as number, e.fullMarks); s.n++;
    bySubject.set(e.subject, s);
  }

  return (
    <>
      <PageHeader title="Exam Results" subtitle={`${child.name} · ${child.studentId}`} />
      <ChildPicker kids={children} selectedId={child.id} basePath="/dashboard/parent/results" />

      {bySubject.size > 0 && (
        <section className="mb-6"><h2 className="h2">Subject-wise average</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...bySubject.entries()].map(([subject, v]) => (
              <StatCard key={subject} label={subject} value={`${Math.round(v.sum / v.n)}%`} hint={`${v.n} exam${v.n > 1 ? "s" : ""}`} tone="indigo" />
            ))}
          </div>
        </section>
      )}

      <section><h2 className="h2">Published results</h2>
        {exams.length === 0 ? <Empty>No results published yet.</Empty> : (
          <TableWrap>
            <thead className="bg-slate-50"><tr><th className="th">Subject</th><th className="th">Exam</th><th className="th">Date</th><th className="th">Marks</th><th className="th">%</th><th className="th">Performance</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((e) => {
                const r = e.results[0]; const p = performanceOf(r?.performance);
                return (
                  <tr key={String(e._id)}>
                    <td className="td font-medium">{e.subject}</td><td className="td">{e.name}</td><td className="td">{formatDate(e.date)}</td>
                    <td className="td">{r?.marks ?? "—"} / {e.fullMarks}</td><td className="td">{r?.marks != null ? `${pct(r.marks, e.fullMarks)}%` : "—"}</td>
                    <td className="td">{p ? <span className={`badge ${p.cls}`}>{p.label}</span> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>)}
      </section>
    </>
  );
}
