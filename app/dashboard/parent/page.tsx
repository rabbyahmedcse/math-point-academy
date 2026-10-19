import Link from "next/link";
import { PageHeader, StatCard, Empty } from "@/components/ui/bits";
import { Avatar } from "@/components/features/parent/ChildPicker";
import { requireRole } from "@/lib/session";
import { childSnapshot, pendingLinkCount, resolveChild } from "@/lib/parent-data";
import { relationshipLabel } from "@/lib/relationship";
import { cn, money } from "@/lib/utils";

export default async function MyChildren({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["parent"]);
  const sp = await searchParams;
  const [{ children, child }, pending] = await Promise.all([resolveChild(user.id, sp.child), pendingLinkCount(user.id)]);
  const snap = child ? await childSnapshot(child) : null;
  const q = (p: string) => `${p}?child=${child?.id}`;

  return (
    <>
      <PageHeader title="My Children" subtitle={`Welcome, ${user.name}. Children registered with your mobile number are added automatically.`} />

      {pending > 0 && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          ⏳ {pending} child link request{pending > 1 ? "s are" : " is"} waiting for a teacher or admin to verify. It will appear here once approved.
        </p>
      )}

      {children.length === 0 ? <Empty>No verified child yet. Children registered with your mobile number appear here automatically once they are approved.</Empty> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {children.map((c) => (
            <Link key={c.id} href={`?child=${c.id}`} className={cn("card flex items-center gap-4 transition hover:shadow-md", c.id === child?.id && "ring-2 ring-indigo-500")}>
              <Avatar name={c.name} image={c.image} size="h-16 w-16 text-2xl" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{c.name}</p>
                <p className="font-mono text-xs text-slate-500">{c.studentId}</p>
                <p className="mt-1 text-sm text-slate-600">{c.className} · {c.batchName}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {child && snap && (
        <section className="mt-6">
          <h2 className="h2">{child.name}</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card lg:col-span-1">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-slate-500">Student ID</dt><dd className="font-mono">{child.studentId}</dd>
                <dt className="text-slate-500">Class</dt><dd>{child.className}</dd>
                <dt className="text-slate-500">Batch</dt><dd>{child.batchName}</dd>
                <dt className="text-slate-500">You are</dt><dd>{relationshipLabel(child.relationship)}</dd>
              </dl>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-2">
              <StatCard label="Attendance" value={`${snap.att.percent}%`} hint={`${snap.att.attended} of ${snap.att.total} classes`} tone={snap.att.total && snap.att.percent < 75 ? "red" : "green"} />
              <StatCard label="Total due" value={money(snap.due)} tone={snap.due ? "red" : "green"} />
              <StatCard label="Latest result" value={snap.latest ? `${snap.latest.marks}/${snap.latest.full}` : "—"} hint={snap.latest ? `${snap.latest.name} · ${snap.latest.subject}` : "No published result"} tone="indigo" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link className="btn btn-secondary" href={q("/dashboard/parent/attendance")}>Attendance</Link>
            <Link className="btn btn-secondary" href={q("/dashboard/parent/routine")}>Routine & Notice</Link>
            <Link className="btn btn-secondary" href={q("/dashboard/parent/fees")}>Monthly Fee</Link>
            <Link className="btn btn-secondary" href={q("/dashboard/parent/results")}>Exam Results</Link>
          </div>
        </section>
      )}

    </>
  );
}
