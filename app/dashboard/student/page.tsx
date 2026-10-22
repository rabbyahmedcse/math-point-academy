
import Link from "next/link";
import { Types } from "mongoose";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { studentAttendance } from "@/lib/stats";
import {
  studentBatch,
  studentFeeMonths,
  studentNotices,
} from "@/lib/student-data";
import {
  expandSessions,
  formatDate,
  formatTime,
  money,
  monthStr,
  todayStr,
} from "@/lib/utils";
import { Routine } from "@/models/Routine";
import { Exam } from "@/models/Exam";
import { Avatar } from "@/components/ui/Avatar";
import {
  BellIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CameraIcon,
  ChartIcon,
  ExclamationIcon,
  GraduationIcon,
  IdIcon,
  MegaphoneIcon,
  PencilIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/ui/icons";
import {
  EmptyState,
  InfoRow,
  Panel,
  Ring,
  StatTile,
  WelcomeBanner,
} from "@/components/features/dashboard/parts";

export default async function StudentDashboard() {
  const user = await requireRole(["student"]);
  await connectDB();

  const [batch, att, notices, months, exam, routines] =
    await Promise.all([
      studentBatch(user.batchId),
      studentAttendance(user.id, user.batchId),
      studentNotices(user.batchId, 3),
      studentFeeMonths({
        id: user.id,
        batchId: user.batchId,
        monthlyFee: user.monthlyFee,
      }),
      user.batchId
        ? Exam.findOne(
            {
              batchId: user.batchId,
              publishStatus: "published",
              status: "scheduled",
            },
            {
              name: 1,
              subject: 1,
              fullMarks: 1,
              results: {
                $elemMatch: {
                  studentId: new Types.ObjectId(user.id),
                },
              },
            }
          )
            .sort({ date: -1 })
            .lean()
        : null,
      user.batchId
        ? Routine.find({ batchId: user.batchId }).lean()
        : Promise.resolve([]),
    ]);

  const due = months.reduce(
    (sum, month) =>
      sum + Math.max(month.amountDue - month.paidTotal, 0),
    0
  );

  const thisMonth = months.find(
    (month) => month.month === monthStr()
  );

  const feeHint = !thisMonth
    ? "No fee record yet"
    : thisMonth.status === "paid"
      ? "This month: paid"
      : thisMonth.status === "partial"
        ? "This month: partially paid"
        : "This month: not paid yet";

  const mark = exam?.results?.[0]?.marks ?? null;

  const upcoming = expandSessions(
    routines,
    todayStr(),
    7
  ).filter(
    (session) => session.routine.status === "scheduled"
  );

  const next = upcoming[0];
  const first = user.name.trim().split(/\s+/)[0];

  return (
    <main className="relative isolate min-w-0 space-y-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 p-1 sm:space-y-7 sm:p-2 lg:p-3">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-[90px] sm:h-80 sm:w-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-[35rem] -z-10 h-72 w-72 rounded-full bg-violet-400/15 blur-[100px]"
      />

      {/* Welcome banner */}
      <section className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 shadow-lg shadow-indigo-950/[0.04] backdrop-blur-xl transition-all duration-500 hover:shadow-xl hover:shadow-indigo-950/[0.07]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gradient-to-br from-indigo-300/20 to-violet-300/20 blur-3xl transition-transform duration-700 group-hover:scale-125"
        />
        <div className="relative">
          <WelcomeBanner name={first} />
        </div>
      </section>

      {/* Profile and statistics */}
      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Profile card */}
        <div className="group relative min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/[0.06] sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-100/70 blur-3xl transition-transform duration-500 group-hover:scale-125"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-400 transition-transform duration-500 group-hover:scale-x-100"
          />

          <div className="relative flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-[2px] shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-[1.03]">
                <div className="rounded-[14px] bg-white p-1">
                  <Avatar
                    name={user.name}
                    image={user.image}
                    size="h-14 w-14 text-xl sm:h-20 sm:w-20 sm:text-3xl"
                  />
                </div>
              </div>

              <Link
                href="/dashboard/student/account/edit"
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6"
              >
                <CameraIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-indigo-700 sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Student profile
              </span>

              <h2 className="mt-2 break-words text-base font-extrabold leading-tight tracking-tight text-slate-900 sm:text-xl">
                {user.name}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Your academic information
              </p>
            </div>

            <Link
              href="/dashboard/student/account/edit"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-indigo-100 bg-white px-2.5 py-2 text-xs font-bold text-indigo-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 sm:px-3 sm:text-sm"
            >
              <PencilIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-3 sm:px-4">
            <InfoRow
              icon={<UserIcon className="h-4 w-4" />}
              label="Name"
            >
              {user.name}
            </InfoRow>

            <InfoRow
              icon={<IdIcon className="h-4 w-4" />}
              label="Student ID"
            >
              <span className="font-mono">{user.studentId}</span>
            </InfoRow>

            <InfoRow
              icon={<BookOpenIcon className="h-4 w-4" />}
              label="Class"
            >
              {user.className || "—"}
            </InfoRow>

            <InfoRow
              icon={<GraduationIcon className="h-4 w-4" />}
              label="Batch"
            >
              {batch?.name ?? "—"}
            </InfoRow>

            <InfoRow
              icon={<PhoneIcon className="h-4 w-4" />}
              label="Mobile"
            >
              {user.phone || "—"}
            </InfoRow>

            <InfoRow
              icon={<UsersIcon className="h-4 w-4" />}
              label="Guardian"
            >
              {user.guardianName
                ? `${user.guardianName} (${user.guardianPhone})`
                : "—"}
            </InfoRow>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid min-w-0 content-start grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="group min-w-0 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(1deg)]">
            <StatTile
              tone="green"
              icon={<UsersIcon className="h-7 w-7" />}
              label="Attendance"
              value={`${att.percent}%`}
              hint={`${att.attended} of ${att.total} classes`}
              right={
                <Ring
                  percent={att.percent}
                  empty={att.total === 0}
                />
              }
            />
          </div>

          <div className="group min-w-0 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(1deg)]">
            <StatTile
              tone="red"
              icon={<WalletIcon className="h-7 w-7" />}
              label="Total due"
              value={money(due)}
              hint={feeHint}
              href="/dashboard/student/fees"
            />
          </div>

          <div className="group min-w-0 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(1deg)]">
            <StatTile
              tone="purple"
              icon={<ChartIcon className="h-7 w-7" />}
              label="Latest result"
              value={mark != null ? `${mark}/${exam!.fullMarks}` : "—"}
              hint={
                mark != null
                  ? `${exam!.name} · ${exam!.subject}`
                  : "No published results"
              }
              href="/dashboard/student/results"
            />
          </div>

          <div className="group min-w-0 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(1deg)]">
            <StatTile
              tone="blue"
              icon={<CalendarIcon className="h-7 w-7" />}
              label="Next class"
              value={next ? formatTime(next.routine.startTime) : "—"}
              hint={
                next
                  ? `${formatDate(next.date)} · ${next.routine.subject}`
                  : "Nothing scheduled"
              }
              href="/dashboard/student/routine"
            />
          </div>
        </div>
      </section>

      {/* Upcoming classes and notices */}
      <section className="grid min-w-0 gap-5 lg:grid-cols-2">
        {/* Upcoming classes */}
        <div className="group/panel min-w-0 rounded-3xl border border-slate-200/80 bg-white/90 p-1 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/[0.05]">
          <Panel
            icon={<CalendarCheckIcon className="h-6 w-6" />}
            title="Upcoming classes"
            href="/dashboard/student/routine"
          >
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<CalendarCheckIcon className="h-7 w-7" />}
                title="No classes in the next 7 days."
                text="Your upcoming classes will appear here."
              />
            ) : (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                {upcoming.slice(0, 4).map((session, index) => (
                  <li
                    key={`${session.date}-${session.routine.subject}-${index}`}
                    className="group/row flex items-center justify-between gap-3 px-3 py-3.5 transition-all duration-200 hover:bg-indigo-50/70 sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600 transition-all duration-300 group-hover/row:scale-105 group-hover/row:shadow-md group-hover/row:shadow-indigo-100">
                        <CalendarIcon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-800">
                          {session.routine.subject}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(session.date)}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-xl border border-indigo-100 bg-indigo-50 px-2.5 py-2 text-[11px] font-extrabold text-indigo-700 sm:text-xs">
                      {formatTime(session.routine.startTime)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Notices */}
        <div className="group/panel min-w-0 rounded-3xl border border-slate-200/80 bg-white/90 p-1 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/[0.05]">
          <Panel
            icon={<BellIcon className="h-6 w-6" />}
            title="Notices"
            href="/dashboard/student/notices"
          >
            {notices.length === 0 ? (
              <EmptyState
                icon={<MegaphoneIcon className="h-7 w-7" />}
                title="No notices."
                text="New notices from your teacher or admin will show here."
              />
            ) : (
              <ul className="space-y-3">
                {notices.map((notice) => (
                  <li
                    key={String(notice._id)}
                    className="group/notice relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-lg hover:shadow-violet-950/[0.04] sm:p-4"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 top-0 w-1 origin-bottom scale-y-0 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500 transition-transform duration-300 group-hover/notice:scale-y-100"
                    />

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-600 transition-transform duration-300 group-hover/notice:scale-105">
                        <MegaphoneIcon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-extrabold leading-6 text-slate-900">
                          {notice.title}
                        </p>

                        <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                          {notice.body}
                        </p>

                        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {formatDate(notice.publishDate)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </section>

      {/* Outstanding fees alert */}
      {due > 0 && (
        <section className="group/alert relative overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-950/[0.05] sm:p-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl transition-transform duration-500 group-hover/alert:scale-125"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-400 to-orange-400"
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 shadow-sm transition-transform duration-300 group-hover/alert:rotate-3 group-hover/alert:scale-105">
                <ExclamationIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <span className="inline-flex rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-rose-600">
                  Payment due
                </span>
                <h3 className="mt-1 text-sm font-extrabold text-slate-900 sm:text-base">
                  Outstanding fee balance
                </h3>
              </div>
            </div>

            <p className="min-w-0 flex-1 text-sm leading-6 text-slate-600">
              You have{" "}
              <strong className="font-extrabold text-rose-600">
                {money(due)}
              </strong>{" "}
              outstanding in fees.
            </p>

            <Link
              href="/dashboard/student/fees"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-rose-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 sm:w-auto"
            >
              View fee details
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
