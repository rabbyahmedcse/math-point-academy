import { PageHeader, Empty, Badge } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor, batchScope } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { Notice } from "@/models/Notice";
import { Batch } from "@/models/Batch";
import { createNotice, deleteNotice } from "@/actions/notices";

export default async function NoticesPage() {
  const user = await requireRole(["admin", "teacher"]);
  await connectDB();
  const batches = await batchesFor(user);
  const mine = await Batch.find(batchScope(user), { _id: 1, name: 1 }).lean();
  const names = new Map((await Batch.find({}, { name: 1 }).lean()).map((b) => [String(b._id), b.name]));
  const notices = await Notice.find(user.role === "admin" ? {} : { $or: [{ createdBy: user.id }, { audience: "batches", batchIds: { $in: mine.map((b) => b._id) } }] }).sort({ createdAt: -1 }).limit(50).lean();
  const canAll = user.role === "admin" || user.permissions.noticeAll;

  return (
    <>
      <PageHeader title="Notices" subtitle="Publish to all students or selected batches" />
      <details className="card mb-6" open><summary className="cursor-pointer font-medium text-indigo-700">+ New notice</summary>
        <ActionForm action={createNotice} submitLabel="Publish notice" className="mt-3 space-y-2">
          <Field label="Title"><input name="title" required className="input" /></Field>
          <Field label="Details"><textarea name="body" required rows={4} className="input" /></Field>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Audience"><select name="audience" defaultValue="batches" className="input">
              <option value="batches">Selected batches</option>
              {canAll && <option value="all">All students</option>}
              {user.role === "admin" && <option value="teachers">Teachers only</option>}
            </select></Field>
            <Field label="Publish date"><input type="date" name="publishDate" className="input" /></Field>
            <Field label="Expires on"><input type="date" name="expiresAt" className="input" /></Field>
          </div>
          <Field label="Batches (for “Selected batches”)">
            <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 p-2">
              {batches.map((b) => <label key={String(b._id)} className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="batchIds" value={String(b._id)} /> {b.name}</label>)}
              {batches.length === 0 && <span className="text-sm text-slate-500">No batches</span>}
            </div>
          </Field>
          <Field label="Attachment link (PDF / image URL, optional)"><input name="attachmentUrl" type="url" className="input" placeholder="https://…" /></Field>
        </ActionForm>
      </details>

      {notices.length === 0 ? <Empty>No notices yet.</Empty> : (
        <div className="space-y-3">
          {notices.map((n) => (
            <article key={String(n._id)} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold">{n.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge value={n.audience === "all" ? "active" : "scheduled"} />
                  <span className="text-xs text-slate-500">{n.audience === "all" ? "All students" : n.audience === "teachers" ? "Teachers" : n.batchIds.map((b) => names.get(String(b))).join(", ")}</span>
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{n.body}</p>
              {n.attachmentUrl && <a href={n.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-indigo-600 hover:underline">📎 Attachment</a>}
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{n.createdByName} · {formatDate(n.publishDate)}{n.expiresAt ? ` · expires ${formatDate(n.expiresAt)}` : ""}</span>
                {(user.role === "admin" || String(n.createdBy) === user.id) && (
                  <ActionForm action={deleteNotice} submitLabel="Delete" submitClassName="btn btn-secondary btn-sm" className=""><input type="hidden" name="id" value={String(n._id)} /></ActionForm>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
