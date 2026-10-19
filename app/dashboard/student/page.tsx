import Link from "next/link";
import { Types } from "mongoose";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { studentAttendance } from "@/lib/stats";
import { studentBatch, studentFeeMonths, studentNotices } from "@/lib/student-data";
import { expandSessions, formatDate, formatTime, money, monthStr, todayStr } from "@/lib/utils";
import { Routine } from "@/models/Routine";
import { Exam } from "@/models/Exam";
import { Avatar } from "@/components/ui/Avatar";
import { BellIcon, BookOpenIcon, CalendarCheckIcon, CalendarIcon, CameraIcon, ChartIcon, ExclamationIcon, GraduationIcon, IdIcon, MegaphoneIcon, PencilIcon, PhoneIcon, UserIcon, UsersIcon, WalletIcon } from "@/components/ui/icons";
import { EmptyState, InfoRow, Panel, Ring, StatTile, WelcomeBanner } from "@/components/features/dashboard/parts";

/** Student home: welcome banner, profile, attendance ring, dues, latest result, next class, notices. */
export default async function StudentDashboard() {
  const user = await requireRole(["student"]);
  await connectDB();
  const [batch, att, notices, months, exam, routines] = await Promise.all([
    studentBatch(user.batchId),
    studentAttendance(user.id, user.batchId),
    studentNotices(user.batchId, 3),
    studentFeeMonths({ id: user.id, batchId: user.batchId, monthlyFee: user.monthlyFee }),
    user.batchId
      ? Exam.findOne({ batchId: user.batchId, publishStatus: "published", status: "scheduled" }, { name: 1, subject: 1, fullMarks: 1, results: { $elemMatch: { studentId: new Types.ObjectId(user.id) } } }).sort({ date: -1 }).lean()
      : null,
    user.batchId ? Routine.find({ batchId: user.batchId }).lean() : Promise.resolve([]),
  ]);

  const due = months.reduce((s, m) => s + Math.max(m.amountDue - m.paidTotal, 0), 0);
  const thisMonth = months.find((m) => m.month === monthStr());
  const feeHint = !thisMonth ? "No fee record yet" : thisMonth.status === "paid" ? "This month: paid" : thisMonth.status === "partial" ? "This month: partially paid" : "This month: not paid yet";
  const mark = exam?.results?.[0]?.marks ?? null;
  const upcoming = expandSessions(routines, todayStr(), 7).filter((s) => s.routine.status === "scheduled");
  const next = upcoming[0];
  const first = user.name.trim().split(/\s+/)[0];

  return (
    <>
      <WelcomeBanner name={first} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* ---- profile ---- */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <Avatar name={user.name} image={user.image} size="h-20 w-20 text-3xl" />
              <Link href="/dashboard/student/account/edit" aria-label="Change photo" className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-500 text-white hover:bg-slate-700"><CameraIcon className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="text-xl font-bold text-slate-900">My profile</h2>
              <p className="text-sm text-slate-500">Student information</p>
            </div>
            <Link href="/dashboard/student/account/edit" className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-sky-100"><PencilIcon className="h-4 w-4" />Edit</Link>
          </div>
          <div className="mt-4 divide-y divide-slate-50">
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Name">{user.name}</InfoRow>
            <InfoRow icon={<IdIcon className="h-4 w-4" />} label="Student ID"><span className="font-mono">{user.studentId}</span></InfoRow>
            <InfoRow icon={<BookOpenIcon className="h-4 w-4" />} label="Class">{user.className || "—"}</InfoRow>
            <InfoRow icon={<GraduationIcon className="h-4 w-4" />} label="Batch">{batch?.name ?? "—"}</InfoRow>
            <InfoRow icon={<PhoneIcon className="h-4 w-4" />} label="Mobile">{user.phone || "—"}</InfoRow>
            <InfoRow icon={<UsersIcon className="h-4 w-4" />} label="Guardian">{user.guardianName ? `${user.guardianName} (${user.guardianPhone})` : "—"}</InfoRow>
          </div>
        </section>

        {/* ---- 2 x 2 tiles ---- */}
        <div className="grid content-start gap-5 md:grid-cols-2">
          <StatTile tone="green" icon={<UsersIcon className="h-7 w-7" />} label="Attendance" value={`${att.percent}%`} hint={`${att.attended} of ${att.total} classes`} right={<Ring percent={att.percent} empty={att.total === 0} />} />
          <StatTile tone="red" icon={<WalletIcon className="h-7 w-7" />} label="Total due" value={money(due)} hint={feeHint} href="/dashboard/student/fees" />
          <StatTile tone="purple" icon={<ChartIcon className="h-7 w-7" />} label="Latest result" value={mark != null ? `${mark}/${exam!.fullMarks}` : "—"} hint={mark != null ? `${exam!.name} · ${exam!.subject}` : "No published results"} href="/dashboard/student/results" />
          <StatTile tone="blue" icon={<CalendarIcon className="h-7 w-7" />} label="Next class" value={next ? formatTime(next.routine.startTime) : "—"} hint={next ? `${formatDate(next.date)} · ${next.routine.subject}` : "Nothing scheduled"} href="/dashboard/student/routine" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel icon={<CalendarCheckIcon className="h-6 w-6" />} title="Upcoming classes" href="/dashboard/student/routine">
          {upcoming.length === 0 ? (
            <EmptyState icon={<CalendarCheckIcon className="h-7 w-7" />} title="No classes in the next 7 days." text="Your upcoming classes will appear here." />
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl bg-slate-50">
              {upcoming.slice(0, 4).map((s, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span><b className="text-slate-900">{s.routine.subject}</b><span className="text-slate-500"> · {formatDate(s.date)}</span></span>
                  <span className="shrink-0 font-medium text-blue-600">{formatTime(s.routine.startTime)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel icon={<BellIcon className="h-6 w-6" />} title="Notices" href="/dashboard/student/notices">
          {notices.length === 0 ? (
            <EmptyState icon={<MegaphoneIcon className="h-7 w-7" />} title="No notices." text="New notices from your teacher or admin will show here." />
          ) : (
            <ul className="space-y-2">
              {notices.map((n) => (
                <li key={String(n._id)} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-600">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(n.publishDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {due > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-3.5">
          <ExclamationIcon className="h-7 w-7 shrink-0 text-red-600" />
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">Due</span>
          <p className="text-sm text-slate-600">You have <b className="text-red-600">{money(due)}</b> outstanding. <Link href="/dashboard/student/fees" className="font-semibold text-blue-600 hover:underline">See fee details →</Link></p>
        </div>
      )}
    </>
  );
}
