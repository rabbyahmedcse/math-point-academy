import { PageHeader, Empty, Badge } from "@/components/ui/bits";
import { ChildPicker, NoChild } from "@/components/features/parent/ChildPicker";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { resolveChild } from "@/lib/parent-data";
import { studentNotices } from "@/lib/student-data";
import { DAYS, expandSessions, formatDate, formatTime, todayStr } from "@/lib/utils";
import { Routine } from "@/models/Routine";
import { Exam } from "@/models/Exam";

export default async function ParentRoutine({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["parent"]);
  const { children, child } = await resolveChild(user.id, (await searchParams).child);
  if (!child) return <NoChild parentId={user.id} />;
  await connectDB();

  const [routines, exams, notices] = await Promise.all([
    child.batchId ? Routine.find({ batchId: child.batchId }).lean() : Promise.resolve([]),
    child.batchId ? Exam.find({ batchId: child.batchId, status: "scheduled", date: { $gte: todayStr() } }).sort({ date: 1 }).lean() : Promise.resolve([]),
    studentNotices(child.batchId, 20),
  ]);
  const sessions = expandSessions(routines, todayStr(), 30);
  const weekly = routines.filter((r) => r.kind === "weekly" && r.status === "scheduled").sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0) || a.startTime.localeCompare(b.startTime));
  const off = sessions.filter((s) => s.routine.status === "cancelled");
  const next = sessions.filter((s) => s.routine.status === "scheduled").slice(0, 8);

  return (
    <>
      <PageHeader title="Routine & Notice" subtitle={`${child.name} · ${child.batchName}`} />
      <ChildPicker kids={children} selectedId={child.id} basePath="/dashboard/parent/routine" />

      <div className="grid gap-6 lg:grid-cols-2">
        <section><h2 className="h2">Weekly class routine</h2>
          {weekly.length === 0 ? <Empty>No routine yet.</Empty> : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {weekly.map((r) => <li key={String(r._id)} className="flex flex-wrap justify-between gap-1 px-4 py-2 text-sm"><span><b>{DAYS[r.dayOfWeek ?? 0]}</b> · {r.subject}</span><span className="text-slate-600">{formatTime(r.startTime)}–{formatTime(r.endTime)}{r.location && ` · ${r.location}`}</span></li>)}
            </ul>)}
        </section>
        <section><h2 className="h2">Upcoming classes</h2>
          {next.length === 0 ? <Empty>Nothing scheduled.</Empty> : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {next.map((s, i) => <li key={i} className="flex justify-between gap-2 px-4 py-2 text-sm"><span>{formatDate(s.date)} · {s.routine.subject}{s.routine.note && <span className="text-xs text-slate-500"> ({s.routine.note})</span>}</span><span className="text-slate-600">{formatTime(s.routine.startTime)}</span></li>)}
            </ul>)}
        </section>
        <section><h2 className="h2">Exam dates</h2>
          {exams.length === 0 ? <Empty>No upcoming exams.</Empty> : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {exams.map((e) => <li key={String(e._id)} className="flex flex-wrap justify-between gap-1 px-4 py-2 text-sm"><span><b>{e.name}</b> · {e.subject}</span><span className="text-slate-600">{formatDate(e.date)} {formatTime(e.startTime)} · {e.fullMarks} marks</span></li>)}
            </ul>)}
        </section>
        <section><h2 className="h2">Cancelled classes / days off (next 30 days)</h2>
          {off.length === 0 ? <Empty>No cancelled classes.</Empty> : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {off.map((s, i) => <li key={i} className="flex flex-wrap items-center justify-between gap-1 px-4 py-2 text-sm"><span>{formatDate(s.date)} · <span className="line-through">{s.routine.subject}</span> <Badge value="cancelled" /></span><span className="text-xs text-slate-500">{s.routine.note}</span></li>)}
            </ul>)}
        </section>
      </div>

      <section className="mt-8"><h2 className="h2">Important notices</h2>
        {notices.length === 0 ? <Empty>No notices.</Empty> : (
          <div className="space-y-3">
            {notices.map((n) => (
              <article key={String(n._id)} className="card">
                <h3 className="font-semibold">{n.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{n.body}</p>
                {n.attachmentUrl && <a href={n.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-indigo-600 hover:underline">📎 Attachment</a>}
                <p className="mt-2 text-xs text-slate-500">{n.createdByName} · {formatDate(n.publishDate)}</p>
              </article>
            ))}
          </div>)}
      </section>
    </>
  );
}
