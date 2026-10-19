import Link from "next/link";
import { PageHeader, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { BatchFilter } from "./BatchFilter";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor, batchScope } from "@/lib/access";
import { formatDate, formatTime, todayStr } from "@/lib/utils";
import { PERFORMANCE_LEVELS } from "@/lib/performance";
import { Exam } from "@/models/Exam";
import { User } from "@/models/User";
import { Batch } from "@/models/Batch";
import { createExam, cancelExam, saveMarks, publishResult, unpublishResult } from "@/actions/exams";

export default async function ExamsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;
  await connectDB();
  const batches = await batchesFor(user);
  const allMine = await Batch.find(batchScope(user), { _id: 1, name: 1 }).lean();
  const names = new Map(allMine.map((b) => [String(b._id), b.name]));
  const exams = await Exam.find({ batchId: { $in: allMine.map((b) => b._id) }, ...(sp.batch ? { batchId: sp.batch } : {}) }).sort({ date: -1 }).limit(50).lean();
  const selected = exams.find((e) => String(e._id) === sp.exam);
  const students = selected ? await User.find({ role: "student", status: "active", batchId: selected.batchId }).sort({ name: 1 }).lean() : [];
  const marks = new Map((selected?.results ?? []).map((r) => [String(r.studentId), r]));

  return (
    <>
      <PageHeader title="Exams & results" subtitle="Schedule exams, enter marks, publish results">
        <BatchFilter batches={batches} selected={sp.batch} label="Filter" />
      </PageHeader>

      <details className="card mb-6"><summary className="cursor-pointer font-medium text-indigo-700">+ Create exam</summary>
        <ActionForm action={createExam} submitLabel="Create exam" className="mt-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Batch"><select name="batchId" required defaultValue="" className="input"><option value="" disabled>Select…</option>{batches.map((b) => <option key={String(b._id)} value={String(b._id)}>{b.name}</option>)}</select></Field>
            <Field label="Exam name"><input name="name" required className="input" placeholder="Monthly test 3" /></Field>
            <Field label="Subject"><input name="subject" required className="input" /></Field>
            <Field label="Date"><input type="date" name="date" required defaultValue={todayStr()} className="input" /></Field>
            <Field label="Start time"><input type="time" name="startTime" className="input" /></Field>
            <Field label="Full marks"><input type="number" name="fullMarks" min={1} required defaultValue={100} className="input" /></Field>
          </div>
        </ActionForm>
      </details>

      {exams.length === 0 ? <Empty>No exams yet.</Empty> : (
        <TableWrap>
          <thead className="bg-slate-50"><tr><th className="th">Exam</th><th className="th">Batch</th><th className="th">Date</th><th className="th">Marks</th><th className="th">Status</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {exams.map((e) => (
              <tr key={String(e._id)} className={String(e._id) === sp.exam ? "bg-indigo-50/50" : ""}>
                <td className="td"><p className="font-medium">{e.name}</p><p className="text-xs text-slate-500">{e.subject}</p></td>
                <td className="td">{names.get(String(e.batchId))}</td>
                <td className="td">{formatDate(e.date)} {formatTime(e.startTime)}</td>
                <td className="td">{e.fullMarks}</td>
                <td className="td">{e.status === "cancelled" ? <Badge value="cancelled" /> : <Badge value={e.publishStatus === "published" ? "published" : "draft"} />}</td>
                <td className="td"><Link className="text-sm text-indigo-600 hover:underline" href={`?${sp.batch ? `batch=${sp.batch}&` : ""}exam=${e._id}`}>Marks</Link></td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      {selected && (
        <section className="card mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="h2 !mb-0">{selected.name} — marks (out of {selected.fullMarks})</h2>
            <div className="flex flex-wrap gap-2">
              {selected.status !== "cancelled" && selected.publishStatus !== "published" && (
                <ActionForm action={publishResult} hideSubmit resetOnSuccess={false}>
                  <input type="hidden" name="examId" value={String(selected._id)} />
                  <button className="btn btn-primary btn-sm">Publish result</button>
                </ActionForm>
              )}
              {selected.publishStatus === "published" && (
                <ActionForm action={unpublishResult} hideSubmit resetOnSuccess={false}><input type="hidden" name="examId" value={String(selected._id)} /><button className="btn btn-secondary btn-sm">Unpublish</button></ActionForm>
              )}
              {selected.status !== "cancelled" && (
                <ActionForm action={cancelExam} hideSubmit resetOnSuccess={false}><input type="hidden" name="examId" value={String(selected._id)} /><button className="btn btn-danger btn-sm">Cancel exam</button></ActionForm>
              )}
            </div>
          </div>
          {selected.publishStatus === "published" && <p className="mb-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Published. You can still correct marks or performance — students see the change immediately and every edit is saved in the audit history.</p>}
          {students.length === 0 ? <Empty>No active students in this batch.</Empty> : (
            <ActionForm action={saveMarks} submitLabel="Save marks" resetOnSuccess={false}>
              <input type="hidden" name="examId" value={String(selected._id)} />
              <div className="overflow-x-auto"><table className="min-w-full"><thead><tr><th className="th">Student</th><th className="th">Marks</th><th className="th">Performance</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={String(s._id)}>
                      <td className="td">{s.name} <span className="text-xs text-slate-500">{s.studentId}</span></td>
                      <td className="td"><input name={`marks:${s._id}`} type="number" step="0.5" min={0} max={selected.fullMarks} defaultValue={marks.get(String(s._id))?.marks ?? ""} className="input w-24" /></td>
                      <td className="td">
                        <select name={`performance:${s._id}`} defaultValue={marks.get(String(s._id))?.performance ?? ""} className="input w-40">
                          <option value="">— Select —</option>
                          {PERFORMANCE_LEVELS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
            </ActionForm>
          )}
          {selected.audit.length > 0 && (
            <details className="mt-4 text-xs text-slate-500"><summary className="cursor-pointer">Audit history ({selected.audit.length})</summary>
              <ul className="mt-1 space-y-0.5">{selected.audit.slice().reverse().map((a, i) => <li key={i}>{formatDate(a.at)} · {a.byName} · {a.action}{a.detail ? ` — ${a.detail}` : ""}</li>)}</ul></details>
          )}
        </section>
      )}
    </>
  );
}
