import { PageHeader, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Batch } from "@/models/Batch";
import { createTeacher, updateTeacher, resetTeacherPassword, updatePermissions } from "@/actions/admin";
import { setUserActive } from "@/actions/students";

const PERMS: [string, string][] = [
  ["manageBatches", "Create / edit own batches"],
  ["approveStudents", "Approve registrations & assign batches"],
  ["feeEntry", "Enter fee payments"],
  ["noticeAll", "Send notices to ALL students"],
];

export default async function TeachersPage() {
  await requireRole(["admin"]);
  await connectDB();
  const teachers = await User.find({ role: "teacher" }).sort({ name: 1 }).lean();
  const counts = await Batch.aggregate([{ $unwind: "$teacherIds" }, { $group: { _id: "$teacherIds", n: { $sum: 1 } } }]);
  const n = new Map(counts.map((c) => [String(c._id), c.n as number]));

  return (
    <>
      <PageHeader title="Teachers" subtitle="Create accounts, reset passwords and control permissions" />
      <details className="card mb-6"><summary className="cursor-pointer font-medium text-indigo-700">+ Create teacher account</summary>
        <ActionForm action={createTeacher} submitLabel="Create account" className="mt-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Full name"><input name="name" required className="input" /></Field>
            <Field label="Email (login)"><input name="email" type="email" required className="input" /></Field>
            <Field label="Mobile (optional)"><input name="phone" className="input" placeholder="01XXXXXXXXX" /></Field>
            <Field label="Temporary password (min 8)"><input name="password" type="text" required minLength={8} className="input" autoComplete="off" /></Field>
          </div>
          <p className="text-xs text-slate-500">The teacher must change this password at first sign-in. Use a password made for this system, not their Gmail password.</p>
        </ActionForm>
      </details>

      {teachers.length === 0 ? <Empty>No teachers yet.</Empty> : (
        <TableWrap>
          <thead className="bg-slate-50"><tr><th className="th">Teacher</th><th className="th">Batches</th><th className="th">Status</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((t) => (
              <tr key={String(t._id)}>
                <td className="td"><p className="font-medium">{t.name}</p><p className="text-xs text-slate-500">{t.email} {t.phone && `· ${t.phone}`}</p></td>
                <td className="td">{n.get(String(t._id)) ?? 0}</td>
                <td className="td"><Badge value={t.status} /></td>
                <td className="td">
                  <details><summary className="cursor-pointer text-sm text-indigo-600">Manage</summary>
                    <div className="mt-2 w-80 space-y-4">
                      <ActionForm action={updateTeacher} submitLabel="Save profile" submitClassName="btn btn-secondary btn-sm" resetOnSuccess={false} className="space-y-2">
                        <input type="hidden" name="id" value={String(t._id)} />
                        <input name="name" defaultValue={t.name} required className="input" />
                        <input name="phone" defaultValue={t.phone ?? ""} className="input" placeholder="Mobile" />
                      </ActionForm>
                      <ActionForm action={updatePermissions} submitLabel="Save permissions" submitClassName="btn btn-secondary btn-sm" resetOnSuccess={false} className="space-y-1">
                        <input type="hidden" name="id" value={String(t._id)} />
                        {PERMS.map(([k, label]) => (
                          <label key={k} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name={k} defaultChecked={(t.permissions as Record<string, boolean> | undefined)?.[k] ?? false} /> {label}
                          </label>
                        ))}
                      </ActionForm>
                      <ActionForm action={resetTeacherPassword} submitLabel="Reset password" submitClassName="btn btn-secondary btn-sm" className="flex items-end gap-2">
                        <input type="hidden" name="id" value={String(t._id)} />
                        <input name="password" minLength={8} required placeholder="New temporary password" className="input" autoComplete="off" />
                      </ActionForm>
                      <ActionForm action={setUserActive} hideSubmit>
                        <input type="hidden" name="id" value={String(t._id)} /><input type="hidden" name="active" value={String(t.status !== "active")} />
                        <button className={t.status === "active" ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"}>{t.status === "active" ? "Deactivate account" : "Activate account"}</button>
                      </ActionForm>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
