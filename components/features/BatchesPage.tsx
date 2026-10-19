import { PageHeader, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchScope } from "@/lib/access";
import { money } from "@/lib/utils";
import { Batch } from "@/models/Batch";
import { User } from "@/models/User";
import { createBatch, updateBatch, setBatchActive } from "@/actions/batches";

export default async function BatchesPage() {
  const user = await requireRole(["admin", "teacher"]);
  await connectDB();
  const isAdmin = user.role === "admin";
  const canManage = isAdmin || user.permissions.manageBatches;
  const [batches, teachers, counts] = await Promise.all([
    Batch.find(batchScope(user)).sort({ status: 1, name: 1 }).lean(),
    isAdmin ? User.find({ role: "teacher", status: "active" }).sort({ name: 1 }).lean() : Promise.resolve([]),
    User.aggregate([{ $match: { role: "student", status: "active" } }, { $group: { _id: "$batchId", n: { $sum: 1 } } }]),
  ]);
  const n = new Map(counts.map((c) => [String(c._id), c.n as number]));
  const tName = new Map((await User.find({ role: "teacher" }, { name: 1 }).lean()).map((t) => [String(t._id), t.name]));

  const fields = (b?: (typeof batches)[number]) => (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Batch name"><input name="name" required defaultValue={b?.name} className="input" placeholder="Class 9 Science A" /></Field>
        <Field label="Class"><input name="className" required defaultValue={b?.className} className="input" /></Field>
        <Field label="Subject"><input name="subject" required defaultValue={b?.subject} className="input" /></Field>
        <Field label="Monthly fee (৳)"><input name="monthlyFee" type="number" min={0} required defaultValue={b?.monthlyFee ?? 0} className="input" /></Field>
      </div>
      <Field label="Description" className="mt-2"><input name="description" defaultValue={b?.description} className="input" /></Field>
      {isAdmin && (
        <Field label="Teachers (hold Ctrl/Cmd to select several)" className="mt-2">
          <select name="teacherIds" multiple defaultValue={(b?.teacherIds ?? []).map(String)} className="input h-24">
            {teachers.map((t) => <option key={String(t._id)} value={String(t._id)}>{t.name}</option>)}
          </select>
        </Field>
      )}
    </>
  );

  return (
    <>
      <PageHeader title="Batches" subtitle="Batches are deactivated, never deleted, so history stays intact" />
      {canManage ? (
        <details className="card mb-6"><summary className="cursor-pointer font-medium text-indigo-700">+ Create a batch</summary>
          <ActionForm action={createBatch} submitLabel="Create batch" className="mt-3">{fields()}</ActionForm>
        </details>
      ) : <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Batch management is not enabled for your account.</p>}

      {batches.length === 0 ? <Empty>No batches yet.</Empty> : (
        <TableWrap>
          <thead className="bg-slate-50"><tr><th className="th">Batch</th><th className="th">Teachers</th><th className="th">Students</th><th className="th">Fee</th><th className="th">Status</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {batches.map((b) => (
              <tr key={String(b._id)}>
                <td className="td"><p className="font-medium">{b.name}</p><p className="text-xs text-slate-500">{b.className} · {b.subject}</p></td>
                <td className="td text-xs">{b.teacherIds.map((t) => tName.get(String(t))).filter(Boolean).join(", ") || "—"}</td>
                <td className="td">{n.get(String(b._id)) ?? 0}</td>
                <td className="td">{money(b.monthlyFee)}</td>
                <td className="td"><Badge value={b.status} /></td>
                <td className="td">
                  {canManage && (
                    <details><summary className="cursor-pointer text-sm text-indigo-600">Edit</summary>
                      <div className="mt-2 w-80">
                        <ActionForm action={updateBatch} submitLabel="Save changes" resetOnSuccess={false}>
                          <input type="hidden" name="id" value={String(b._id)} />{fields(b)}
                        </ActionForm>
                        <ActionForm action={setBatchActive} hideSubmit className="mt-2">
                          <input type="hidden" name="id" value={String(b._id)} /><input type="hidden" name="active" value={String(b.status !== "active")} />
                          <button className="btn btn-secondary btn-sm">{b.status === "active" ? "Deactivate" : "Activate"}</button>
                        </ActionForm>
                      </div>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
