import { PageHeader, Empty, Badge } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Material } from "@/models/Misc";

export default async function StudentMaterials() {
  const user = await requireRole(["student"]);
  await connectDB();
  const items = user.batchId ? await Material.find({ batchId: user.batchId }).sort({ createdAt: -1 }).lean() : [];
  return (
    <>
      <PageHeader title="Homework & materials" />
      {items.length === 0 ? <Empty>Nothing shared with your batch yet.</Empty> : (
        <ul className="space-y-2">
          {items.map((m) => (
            <li key={String(m._id)} className="card">
              <p className="font-medium">{m.title} <Badge value={m.kind === "homework" ? "due" : "scheduled"} /> <span className="text-xs font-normal text-slate-500">{m.kind}</span></p>
              {m.description && <p className="text-sm text-slate-600">{m.description}</p>}
              <p className="text-xs text-slate-500">{m.createdByName} · {formatDate(m.createdAt)}</p>
              {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-indigo-600 hover:underline">Open / download</a>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
