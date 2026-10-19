import { PageHeader, Badge, Empty, TableWrap } from "@/components/ui/bits";
import { ActionForm } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { formatDate, money } from "@/lib/utils";
import { User } from "@/models/User";
import { Batch } from "@/models/Batch";
import { ParentLink } from "@/models/ParentLink";
import { approveParentLink, rejectParentLink } from "@/actions/parent";
import { relationshipLabel } from "@/lib/relationship";
import { approveStudent, rejectStudent, assignBatch, setUserActive, updateStudentFee } from "@/actions/students";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Pending registrations (approve + assign batch / reject) and the student directory. */
export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;
  await connectDB();
  const isAdmin = user.role === "admin";
  const canApprove = isAdmin || user.permissions.approveStudents;

  const batches = await batchesFor(user);
  const batchName = new Map((await Batch.find({}, { name: 1 }).lean()).map((b) => [String(b._id), b.name]));

  const pending = canApprove ? await User.find({ role: "student", status: "pending" }).sort({ createdAt: 1 }).lean() : [];

  // Parent link requests whose phone did not match -> staff verifies manually
  const reqStudents = canApprove
    ? await User.find({ role: "student", status: "active", ...(isAdmin ? {} : { batchId: { $in: batches.map((b) => b._id) } }) }, { name: 1, studentId: 1, guardianPhone: 1 }).lean()
    : [];
  const linkReqs = canApprove ? await ParentLink.find({ status: "pending", studentId: { $in: reqStudents.map((s) => s._id) } }).sort({ createdAt: 1 }).lean() : [];
  const reqParents = new Map((await User.find({ _id: { $in: linkReqs.map((l) => l.parentId) } }, { name: 1, email: 1, phone: 1 }).lean()).map((u) => [String(u._id), u]));
  const reqStudentMap = new Map(reqStudents.map((s) => [String(s._id), s]));

  const filter: Record<string, unknown> = { role: "student", status: { $ne: "pending" } };
  if (!isAdmin) filter.batchId = { $in: batches.map((b) => b._id) };
  if (sp.batch) filter.batchId = sp.batch;
  if (sp.q) filter.$or = [{ name: new RegExp(esc(sp.q), "i") }, { studentId: new RegExp(esc(sp.q), "i") }, { phone: new RegExp(esc(sp.q), "i") }];
  const students = await User.find(filter).sort({ name: 1 }).limit(200).lean();

  return (
    <>
      <PageHeader title="Students" subtitle="Approve registrations, assign batches and manage students" />

      {!canApprove && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">The admin has not enabled registration approval for your account.</p>}

      {canApprove && (
        <section className="mb-8">
          <h2 className="h2">Pending registrations ({pending.length})</h2>
          {pending.length === 0 ? <Empty>No pending registrations.</Empty> : (
            <div className="grid gap-3 lg:grid-cols-2">
              {pending.map((s) => (
                <div key={String(s._id)} className="card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.studentId} · {s.className} · registered {formatDate(s.createdAt)}</p>
                    </div>
                    <Badge value="pending" />
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-1 text-sm text-slate-600">
                    <div>📧 {s.email}</div><div>📱 {s.phone}</div>
                    <div>Guardian: {s.guardianName}</div><div>📱 {s.guardianPhone}</div>
                    {s.address && <div className="col-span-2">📍 {s.address}</div>}
                  </dl>
                  <ActionForm action={approveStudent} submitLabel="Approve & assign" resetOnSuccess={false} className="mt-3 flex flex-wrap items-end gap-2">
                    <input type="hidden" name="studentId" value={String(s._id)} />
                    <label className="block grow"><span className="label">Assign to batch</span>
                      <select name="batchId" required defaultValue="" className="input">
                        <option value="" disabled>Select batch…</option>
                        {batches.map((b) => <option key={String(b._id)} value={String(b._id)}>{b.name} — {b.className}</option>)}
                      </select>
                    </label>
                  </ActionForm>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-600">Reject…</summary>
                    <ActionForm action={rejectStudent} submitLabel="Reject registration" submitClassName="btn btn-danger btn-sm" resetOnSuccess={false} className="mt-2 space-y-2">
                      <input type="hidden" name="studentId" value={String(s._id)} />
                      <input name="reason" className="input" placeholder="Reason (optional)" />
                    </ActionForm>
                  </details>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {canApprove && linkReqs.length > 0 && (
        <section className="mb-8">
          <h2 className="h2">Parent link requests ({linkReqs.length})</h2>
          <p className="mb-3 text-sm text-slate-500">The parent&apos;s mobile did not match the guardian mobile saved at student registration. Approve only if you recognise the parent.</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {linkReqs.map((l) => {
              const par = reqParents.get(String(l.parentId)); const stu = reqStudentMap.get(String(l.studentId));
              return (
                <div key={String(l._id)} className="card">
                  <p className="font-semibold">{par?.name} <span className="text-sm font-normal text-slate-500">({relationshipLabel(l.relationship)})</span></p>
                  <p className="text-sm text-slate-600">📧 {par?.email} · 📱 {par?.phone}</p>
                  <p className="mt-1 text-sm">wants to see <b>{stu?.name}</b> <span className="text-xs text-slate-500">{stu?.studentId}</span></p>
                  <p className="text-xs text-slate-500">Guardian mobile on record: {stu?.guardianPhone || "—"}</p>
                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <ActionForm action={approveParentLink} submitLabel="Approve" resetOnSuccess={false}><input type="hidden" name="linkId" value={String(l._id)} /></ActionForm>
                    <ActionForm action={rejectParentLink} submitLabel="Reject" submitClassName="btn btn-danger" resetOnSuccess={false} className="flex items-start gap-2">
                      <input type="hidden" name="linkId" value={String(l._id)} /><input name="reason" placeholder="Reason (optional)" className="input w-44" />
                    </ActionForm>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="h2 !mb-0">All students ({students.length})</h2>
          <form className="flex flex-wrap gap-2">
            <input name="q" defaultValue={sp.q} placeholder="Search name / ID / phone" className="input w-52" />
            <select name="batch" defaultValue={sp.batch ?? ""} className="input w-44">
              <option value="">All batches</option>
              {batches.map((b) => <option key={String(b._id)} value={String(b._id)}>{b.name}</option>)}
            </select>
            <button className="btn btn-secondary">Filter</button>
          </form>
        </div>
        {students.length === 0 ? <Empty>No students found.</Empty> : (
          <TableWrap>
            <thead className="bg-slate-50"><tr>
              <th className="th">Student</th><th className="th">Class / Batch</th><th className="th">Contact</th><th className="th">Status</th><th className="th">Manage</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={String(s._id)}>
                  <td className="td"><p className="font-medium">{s.name}</p><p className="text-xs text-slate-500">{s.studentId}</p></td>
                  <td className="td">{s.className}<br /><span className="text-xs text-slate-500">{s.batchId ? batchName.get(String(s.batchId)) : "—"}</span></td>
                  <td className="td text-xs">{s.phone}<br />Guardian: {s.guardianPhone}</td>
                  <td className="td"><Badge value={s.status} /></td>
                  <td className="td">
                    <details>
                      <summary className="cursor-pointer text-sm text-indigo-600">Manage</summary>
                      <div className="mt-2 w-64 space-y-3">
                        {canApprove && s.status === "active" && (
                          <ActionForm action={assignBatch} submitLabel="Move" submitClassName="btn btn-secondary btn-sm" resetOnSuccess={false} className="flex items-end gap-2">
                            <input type="hidden" name="studentId" value={String(s._id)} />
                            <select name="batchId" defaultValue={String(s.batchId ?? "")} className="input">
                              {batches.map((b) => <option key={String(b._id)} value={String(b._id)}>{b.name}</option>)}
                            </select>
                          </ActionForm>
                        )}
                        {isAdmin && (
                          <>
                            <ActionForm action={updateStudentFee} submitLabel="Set fee" submitClassName="btn btn-secondary btn-sm" resetOnSuccess={false} className="flex items-end gap-2">
                              <input type="hidden" name="id" value={String(s._id)} />
                              <input name="monthlyFee" type="number" min={0} defaultValue={s.monthlyFee ?? ""} placeholder="Batch default" className="input" />
                            </ActionForm>
                            {(s.status === "active" || s.status === "inactive") && (
                              <ActionForm action={setUserActive} hideSubmit className="">
                                <input type="hidden" name="id" value={String(s._id)} />
                                <input type="hidden" name="active" value={String(s.status !== "active")} />
                                <button className={s.status === "active" ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"}>{s.status === "active" ? "Deactivate" : "Activate"}</button>
                              </ActionForm>
                            )}
                          </>
                        )}
                        {s.monthlyFee != null && <p className="text-xs text-slate-500">Custom fee: {money(s.monthlyFee)}</p>}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </section>
    </>
  );
}
