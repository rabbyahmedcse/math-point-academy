import { PageHeader, Empty } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { studentNotices } from "@/lib/student-data";
import { formatDate } from "@/lib/utils";

export default async function StudentNotices() {
  const user = await requireRole(["student"]);
  const notices = await studentNotices(user.batchId, 50);
  return (
    <>
      <PageHeader title="Notice board" />
      {notices.length === 0 ? <Empty>No notices.</Empty> : (
        <div className="space-y-3">
          {notices.map((n) => (
            <article key={String(n._id)} className="card">
              <h2 className="font-semibold">{n.title}</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{n.body}</p>
              {n.attachmentUrl && <a href={n.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-indigo-600 hover:underline">📎 Attachment</a>}
              <p className="mt-2 text-xs text-slate-500">{n.createdByName} · {formatDate(n.publishDate)}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
