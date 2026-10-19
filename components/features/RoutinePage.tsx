import { PageHeader, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { BatchFilter } from "./BatchFilter";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { DAYS, formatDate, formatTime, todayStr } from "@/lib/utils";
import { Routine } from "@/models/Routine";
import { User } from "@/models/User";
import { createRoutine, deleteRoutine, cancelClass, rescheduleClass } from "@/actions/routines";

export default async function RoutinePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;
  await connectDB();
  const batches = await batchesFor(user);
  const batch = batches.find((b) => String(b._id) === sp.batch);
  const teachers = user.role === "admin" ? await User.find({ role: "teacher", status: "active" }).sort({ name: 1 }).lean() : [];

  const routines = batch ? await Routine.find({ batchId: batch._id, $or: [{ kind: "weekly" }, { date: { $gte: todayStr() } }] }).sort({ dayOfWeek: 1, date: 1, startTime: 1 }).lean() : [];
  const weekly = routines.filter((r) => r.kind === "weekly");
  const oneoff = routines.filter((r) => r.kind === "oneoff");

  const row = (r: (typeof routines)[number]) => (
    <tr key={String(r._id)} className={r.status === "cancelled" ? "opacity-60" : ""}>
      <td className="td">{r.kind === "weekly" ? DAYS[r.dayOfWeek ?? 0] : formatDate(r.date)}</td>
      <td className="td">{formatTime(r.startTime)} – {formatTime(r.endTime)}</td>
      <td className="td">{r.subject}<br /><span className="text-xs text-slate-500">{r.location}{r.note ? ` · ${r.note}` : ""}</span></td>
      <td className="td"><Badge value={r.status} /></td>
      <td className="td">
        {r.status === "scheduled" && (
          <details><summary className="cursor-pointer text-sm text-indigo-600">Change</summary>
            <div className="mt-2 w-72 space-y-3">
              <ActionForm action={cancelClass} submitLabel="Cancel class" submitClassName="btn btn-danger btn-sm" className="space-y-2">
                <input type="hidden" name="id" value={String(r._id)} />
                {r.kind === "weekly" && <Field label="Date to cancel"><input type="date" name="date" required className="input" /></Field>}
                <input name="reason" placeholder="Reason (shown to students)" className="input" />
              </ActionForm>
              <ActionForm action={rescheduleClass} submitLabel="Reschedule" submitClassName="btn btn-secondary btn-sm" className="space-y-2">
                <input type="hidden" name="id" value={String(r._id)} />
                {r.kind === "weekly" && <Field label="Original date"><input type="date" name="fromDate" required className="input" /></Field>}
                <Field label="New date"><input type="date" name="newDate" required defaultValue={todayStr()} className="input" /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start"><input type="time" name="startTime" required defaultValue={r.startTime} className="input" /></Field>
                  <Field label="End"><input type="time" name="endTime" required defaultValue={r.endTime} className="input" /></Field>
                </div>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="force" /> Save anyway if teacher has a conflict</label>
              </ActionForm>
              <ActionForm action={deleteRoutine} submitLabel="Remove entry" submitClassName="btn btn-secondary btn-sm" className=""><input type="hidden" name="id" value={String(r._id)} /></ActionForm>
            </div>
          </details>
        )}
      </td>
    </tr>
  );
  const head = <thead className="bg-slate-50"><tr><th className="th">When</th><th className="th">Time</th><th className="th">Subject</th><th className="th">Status</th><th className="th" /></tr></thead>;

  return (
    <>
      <PageHeader title="Class routine" subtitle="Weekly schedule, extra classes, cancellations and reschedules">
        <BatchFilter batches={batches} selected={sp.batch} label="Open" />
      </PageHeader>
      {!batch ? <Empty>Select a batch to manage its routine.</Empty> : (
        <div className="space-y-6">
          <details className="card"><summary className="cursor-pointer font-medium text-indigo-700">+ Add class</summary>
            <ActionForm action={createRoutine} submitLabel="Add to routine" className="mt-3 space-y-2">
              <input type="hidden" name="batchId" value={String(batch._id)} />
              <div className="grid gap-2 sm:grid-cols-3">
                <Field label="Type"><select name="kind" className="input"><option value="weekly">Weekly (repeats)</option><option value="oneoff">One-off / extra class</option></select></Field>
                <Field label="Weekday (weekly)"><select name="dayOfWeek" className="input">{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></Field>
                <Field label="Date (one-off)"><input type="date" name="date" className="input" /></Field>
                <Field label="Start"><input type="time" name="startTime" required className="input" /></Field>
                <Field label="End"><input type="time" name="endTime" required className="input" /></Field>
                <Field label="Subject"><input name="subject" required defaultValue={batch.subject} className="input" /></Field>
                <Field label="Location"><input name="location" className="input" placeholder="Room 2" /></Field>
                {user.role === "admin" && (
                  <Field label="Teacher"><select name="teacherId" className="input"><option value="">Batch teacher</option>{teachers.map((t) => <option key={String(t._id)} value={String(t._id)}>{t.name}</option>)}</select></Field>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="force" /> Save anyway if the teacher already has a class at this time</label>
            </ActionForm>
          </details>
          <section><h2 className="h2">Weekly</h2>{weekly.length ? <TableWrap>{head}<tbody className="divide-y divide-slate-100">{weekly.map(row)}</tbody></TableWrap> : <Empty>No weekly classes yet.</Empty>}</section>
          <section><h2 className="h2">Upcoming one-off / rescheduled</h2>{oneoff.length ? <TableWrap>{head}<tbody className="divide-y divide-slate-100">{oneoff.map(row)}</tbody></TableWrap> : <Empty>Nothing scheduled.</Empty>}</section>
        </div>
      )}
    </>
  );
}
