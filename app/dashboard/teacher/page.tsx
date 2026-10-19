import Link from "next/link";
import { PageHeader, StatCard, Empty } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { attendanceToday, todaysClasses } from "@/lib/stats";
import { formatTime } from "@/lib/utils";
import { User } from "@/models/User";

export default async function TeacherDashboard() {
  const user = await requireRole(["teacher"]);
  await connectDB();
  const batches = await batchesFor(user);
  const ids = batches.map((b) => b._id);
  const [students, pending, classes, att] = await Promise.all([
    User.countDocuments({ role: "student", status: "active", batchId: { $in: ids } }),
    user.permissions.approveStudents ? User.countDocuments({ role: "student", status: "pending" }) : 0,
    todaysClasses(ids),
    attendanceToday(ids),
  ]);
  return (
    <>
      <PageHeader title={`Hello, ${user.name}`} subtitle="Your day at a glance" />
      {pending > 0 && (
        <Link href="/dashboard/teacher/students" className="mb-4 block rounded-lg bg-amber-50 p-3 text-sm text-amber-900 hover:bg-amber-100">
          ⏳ <b>{pending}</b> registration{pending > 1 ? "s" : ""} to review →
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="My batches" value={batches.length} tone="indigo" />
        <StatCard label="My students" value={students} />
        <StatCard label="Classes today" value={classes.length} />
        <StatCard label="Marked today" value={`${att.present + att.late + att.absent}`} hint={`${att.absent} absent`} />
      </div>
      <section className="mt-6">
        <h2 className="h2">Today&apos;s classes</h2>
        {classes.length === 0 ? <Empty>No classes today.</Empty> : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {classes.map((c) => (
              <li key={String(c._id)} className="flex flex-wrap justify-between gap-2 px-4 py-2 text-sm">
                <span><b>{c.subject}</b> · {c.batchName}</span><span>{formatTime(c.startTime)}–{formatTime(c.endTime)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
