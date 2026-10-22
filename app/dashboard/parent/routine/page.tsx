
import { PageHeader, Empty, Badge } from "@/components/ui/bits";
import { ChildPicker, NoChild } from "@/components/features/parent/ChildPicker";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { resolveChild } from "@/lib/parent-data";
import { studentNotices } from "@/lib/student-data";
import { DAYS, expandSessions, formatDate, formatTime, todayStr } from "@/lib/utils";
import { Routine } from "@/models/Routine";
import { Exam } from "@/models/Exam";

export default async function ParentRoutine({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["parent"]);
  const { children, child } = await resolveChild(user.id, (await searchParams).child);
  if (!child) return <NoChild parentId={user.id} />;
  await connectDB();

  const [routines, exams, notices] = await Promise.all([
    child.batchId ? Routine.find({ batchId: child.batchId }).lean() : Promise.resolve([]),
    child.batchId
      ? Exam.find({
          batchId: child.batchId,
          status: "scheduled",
          date: { $gte: todayStr() },
        })
          .sort({ date: 1 })
          .lean()
      : Promise.resolve([]),
    studentNotices(child.batchId, 20),
  ]);

  const sessions = expandSessions(routines, todayStr(), 30);
  const weekly = routines
    .filter((r) => r.kind === "weekly" && r.status === "scheduled")
    .sort(
      (a, b) =>
        (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0) ||
        a.startTime.localeCompare(b.startTime)
    );
  const off = sessions.filter((s) => s.routine.status === "cancelled");
  const next = sessions
    .filter((s) => s.routine.status === "scheduled")
    .slice(0, 8);

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-80 -z-10 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl"
      />

      {/* Page header */}
      <section className="rounded-3xl border border-white/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-lg shadow-indigo-950/[0.04] sm:p-7">
        <PageHeader
          title="Routine & Notice"
          subtitle={`${child.name} · ${child.batchName}`}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Student Schedule
          </span>
          <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500">
            {child.studentId}
          </span>
        </div>
      </section>

      {/* Child selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-300 hover:shadow-md sm:p-4">
        <ChildPicker
          kids={children}
          selectedId={child.id}
          basePath="/dashboard/parent/routine"
        />
      </div>

      {/* Schedule cards */}
      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        {/* Weekly routine */}
        <section className="group min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/[0.06]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="3" />
                  <path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  Weekly Class Routine
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Regular weekly classes
                </p>
              </div>
            </div>
          </div>

          {weekly.length === 0 ? (
            <div className="p-6 text-center">
              <Empty>No routine yet.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {weekly.map((r) => (
                <li
                  key={String(r._id)}
                  className="group/row flex flex-col gap-3 px-5 py-4 transition-colors duration-200 hover:bg-indigo-50/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 min-w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 px-2 text-xs font-extrabold text-indigo-700 transition-all duration-300 group-hover/row:bg-indigo-600 group-hover/row:text-white">
                      {DAYS[r.dayOfWeek ?? 0]}
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-slate-800">
                        {r.subject}
                      </p>
                      {r.location && (
                        <p className="mt-1 break-words text-xs text-slate-500">
                          📍 {r.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-indigo-500" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {formatTime(r.startTime)}–{formatTime(r.endTime)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming classes */}
        <section className="group min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/[0.06]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50/90 via-white to-indigo-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 transition-transform duration-300 group-hover:rotate-[4deg] group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2M16 3l2 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  Upcoming Classes
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your next scheduled sessions
                </p>
              </div>
            </div>
          </div>

          {next.length === 0 ? (
            <div className="p-6 text-center">
              <Empty>Nothing scheduled.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {next.map((s, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors duration-200 hover:bg-violet-50/50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="16" rx="3" />
                        <path d="M16 3v4M8 3v4M3 10h18" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-violet-700">
                        {formatDate(s.date)}
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-800">
                        {s.routine.subject}
                      </p>
                      {s.routine.note && (
                        <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                          {s.routine.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {formatTime(s.routine.startTime)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming exams */}
        <section className="group min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/[0.06]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50/90 via-white to-indigo-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                  <path d="M8 4h8M9 3h6v3H9z" />
                  <rect x="4" y="5" width="16" height="16" rx="2.5" />
                  <path d="m8 13 2.5 2.5L16 10" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  Exam Dates
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Scheduled upcoming examinations
                </p>
              </div>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="p-6 text-center">
              <Empty>No upcoming exams.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {exams.map((e) => (
                <li
                  key={String(e._id)}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors duration-200 hover:bg-sky-50/50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-slate-800">
                      {e.name}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {e.subject}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sky-700">
                      {formatDate(e.date)}
                    </span>
                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                      {formatTime(e.startTime)}
                    </span>
                    <span className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-indigo-700">
                      {e.fullMarks} marks
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Cancelled classes */}
        <section className="group min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-950/[0.05]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50/90 via-white to-orange-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20 transition-transform duration-300 group-hover:rotate-[4deg] group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 9 6 6m0-6-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  Cancelled Classes / Days Off
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Within the next 30 days
                </p>
              </div>
            </div>
          </div>

          {off.length === 0 ? (
            <div className="p-6 text-center">
              <Empty>No cancelled classes.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {off.map((s, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors duration-200 hover:bg-rose-50/50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-rose-600">
                      {formatDate(s.date)}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="break-words text-sm font-semibold text-slate-500 line-through">
                        {s.routine.subject}
                      </span>
                      <Badge value="cancelled" />
                    </div>
                  </div>
                  {s.routine.note && (
                    <p className="break-words text-xs leading-5 text-slate-500 sm:max-w-48 sm:text-right">
                      {s.routine.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Important notices */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                Important Notices
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Announcements and updates from the coaching center
              </p>
            </div>
          </div>
        </div>

        {notices.length === 0 ? (
          <div className="p-6 text-center">
            <Empty>No notices.</Empty>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            {notices.map((n) => (
              <article
                key={String(n._id)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/[0.05] sm:p-5"
              >
                <div
                  aria-hidden
                  className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 opacity-70 transition-opacity group-hover:opacity-100"
                />

                <div className="pl-2">
                  <h3 className="break-words text-base font-extrabold text-slate-800 transition-colors group-hover:text-indigo-700">
                    {n.title}
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {n.body}
                  </p>

                  {n.attachmentUrl && (
                    <a
                      href={n.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2.5 text-sm font-bold text-indigo-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                    >
                      <span aria-hidden>📎</span>
                      Attachment
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                        <path d="M14 4h6v6M20 4l-9 9" />
                        <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
                      </svg>
                    </a>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">
                      {n.createdByName}
                    </span>
                    <span aria-hidden className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{formatDate(n.publishDate)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
