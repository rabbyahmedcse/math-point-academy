import { PageHeader, Empty, Badge } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { DAYS, expandSessions, formatDate, formatTime, todayStr } from "@/lib/utils";
import { Routine } from "@/models/Routine";

export default async function StudentRoutine() {
  const user = await requireRole(["student"]);
  await connectDB();
  const routines = user.batchId ? await Routine.find({ batchId: user.batchId }).lean() : [];
  const sessions = expandSessions(routines, todayStr(), 14);
  const weekly = routines.filter((r) => r.kind === "weekly" && r.status === "scheduled").sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0) || a.startTime.localeCompare(b.startTime));
  return (
    <>
      <PageHeader title="My routine" subtitle="Weekly schedule and the next 14 days (cancellations and changes included)" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section><h2 className="h2">Weekly</h2>
          {weekly.length === 0 ? <Empty>No routine yet.</Empty> : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {weekly.map((r) => <li key={String(r._id)} className="flex justify-between px-4 py-2 text-sm"><span><b>{DAYS[r.dayOfWeek ?? 0]}</b> · {r.subject}</span><span className="text-slate-600">{formatTime(r.startTime)}–{formatTime(r.endTime)}{r.location && ` · ${r.location}`}</span></li>)}
            </ul>)}
        </section>
        <section><h2 className="h2">Next 14 days</h2>
          {sessions.length === 0 ? <Empty>Nothing scheduled.</Empty> : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {sessions.map((s, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-1 px-4 py-2 text-sm">
                  <span>{formatDate(s.date)} · <b className={s.routine.status === "cancelled" ? "line-through" : ""}>{s.routine.subject}</b> {s.routine.status === "cancelled" && <Badge value="cancelled" />} {s.routine.note && <span className="text-xs text-slate-500">{s.routine.note}</span>}</span>
                  <span className="text-slate-600">{formatTime(s.routine.startTime)}–{formatTime(s.routine.endTime)}</span>
                </li>
              ))}
            </ul>)}
        </section>
      </div>
    </>
  );
}
