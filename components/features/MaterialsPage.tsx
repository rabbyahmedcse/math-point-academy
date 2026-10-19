import { PageHeader, Empty, Badge } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor, batchScope } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { Material } from "@/models/Misc";
import { Batch } from "@/models/Batch";
import { createMaterial, deleteMaterial } from "@/actions/materials";

export default async function MaterialsPage() {
  const user = await requireRole(["admin", "teacher"]);
  await connectDB();
  const batches = await batchesFor(user);
  const all = await Batch.find(batchScope(user), { _id: 1, name: 1 }).lean();
  const names = new Map(all.map((b) => [String(b._id), b.name]));
  const items = await Material.find({ batchId: { $in: all.map((b) => b._id) } }).sort({ createdAt: -1 }).limit(100).lean();

  return (
    <>
      <PageHeader title="Homework & study materials" subtitle="Share links to PDFs, images or videos with a batch" />
      <details className="card mb-6"><summary className="cursor-pointer font-medium text-indigo-700">+ Add</summary>
        <ActionForm action={createMaterial} submitLabel="Publish" className="mt-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Batch"><select name="batchId" required defaultValue="" className="input"><option value="" disabled>Select…</option>{batches.map((b) => <option key={String(b._id)} value={String(b._id)}>{b.name}</option>)}</select></Field>
            <Field label="Type"><select name="kind" className="input"><option value="material">Study material</option><option value="homework">Homework</option></select></Field>
            <Field label="Title"><input name="title" required className="input" /></Field>
          </div>
          <Field label="Description"><input name="description" className="input" /></Field>
          <Field label="Link (Drive / PDF / image URL)"><input name="url" type="url" className="input" placeholder="https://…" /></Field>
        </ActionForm>
      </details>
      {items.length === 0 ? <Empty>Nothing shared yet.</Empty> : (
        <ul className="space-y-2">
          {items.map((m) => (
            <li key={String(m._id)} className="card flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-medium">{m.title} <Badge value={m.kind === "homework" ? "due" : "scheduled"} /></p>
                <p className="text-xs text-slate-500">{names.get(String(m.batchId))} · {formatDate(m.createdAt)} · {m.createdByName}</p>
                {m.description && <p className="text-sm text-slate-600">{m.description}</p>}
                {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">Open link</a>}</div>
              <ActionForm action={deleteMaterial} submitLabel="Delete" submitClassName="btn btn-secondary btn-sm" className=""><input type="hidden" name="id" value={String(m._id)} /></ActionForm>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
