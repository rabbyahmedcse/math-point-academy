
import { PageHeader, Empty, Badge } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import {
  DAYS,
  expandSessions,
  formatDate,
  formatTime,
  todayStr,
} from "@/lib/utils";
import { Routine } from "@/models/Routine";

export default async function StudentRoutine() {
  const user = await requireRole(["student"]);
  await connectDB();

  const routines = user.batchId
    ? await Routine.find({ batchId: user.batchId }).lean()
    : [];

  const sessions = expandSessions(routines, todayStr(), 14);

  const weekly = routines
    .filter((r) => r.kind === "weekly" && r.status === "scheduled")
    .sort(
      (a, b) =>
        (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0) ||
        a.startTime.localeCompare(b.startTime)
    );

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-8 -z-10 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-4 top-80 -z-10 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"
      />

      {/* Page header */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-5 shadow-sm shadow-indigo-100/50 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-violet-300/20 blur-3xl"
        />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <rect x="3.5" y="5" width="17" height="15" rx="2" />
              <path
                d="M7.5 3v4M16.5 3v4M3.5 10h17M8 14h3M8 17h6"
                strokeLinecap="round"
              />
            </svg>
            STUDENT SCHEDULE
          </div>

          <PageHeader
            title="My routine"
            subtitle="Weekly schedule and the next 14 days (cancellations and changes included)"
          />

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Keep track of your regular classes and upcoming sessions in one
            place.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm sm:text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="3.5" y="5" width="17" height="15" rx="2" />
                  <path
                    d="M7.5 3v4M16.5 3v4M3.5 10h17"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              Weekly classes
            </span>

            <span className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm sm:text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" />
                </svg>
              </span>
              Next 14 days
            </span>
          </div>
        </div>
      </section>

      {/* Routine sections */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        {/* Weekly routine */}
        <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 transition-shadow duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-indigo-100/80 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 px-4 py-4 sm:px-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/70">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="3.5" y="5" width="17" height="15" rx="2" />
                <path
                  d="M7.5 3v4M16.5 3v4M3.5 10h17M8 14h3M8 17h5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                Weekly routine
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Your regular scheduled classes
              </p>
            </div>
          </div>

          {weekly.length === 0 ? (
            <div className="p-4 sm:p-6">
              <Empty>No routine yet.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {weekly.map((r) => (
                <li
                  key={String(r._id)}
                  className="group flex flex-col gap-3 p-4 transition-colors duration-200 hover:bg-indigo-50/40 sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 transition-all duration-200 group-hover:bg-indigo-100">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 3 21 8v6c0 4-3.8 6.5-9 8-5.2-1.5-9-4-9-8V8l9-5Z"
                        />
                        <path
                          d="M9 12h6M12 9v6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 transition-colors group-hover:text-indigo-700">
                        {DAYS[r.dayOfWeek ?? 0]}
                      </p>
                      <p className="mt-1 break-words text-sm text-slate-600">
                        {r.subject}
                      </p>

                      {r.location && (
                        <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          >
                            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                            <circle cx="12" cy="10" r="2.5" />
                          </svg>
                          <span className="break-words">{r.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-[52px]">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50/80 px-2.5 py-2 text-xs font-semibold text-indigo-700 sm:text-sm">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" strokeLinecap="round" />
                      </svg>
                      {formatTime(r.startTime)}–{formatTime(r.endTime)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Next 14 days */}
        <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 transition-shadow duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-violet-100/80 bg-gradient-to-r from-violet-50/80 via-white to-indigo-50/70 px-4 py-4 sm:px-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200/70">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                Next 14 days
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Upcoming classes and schedule changes
              </p>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="p-4 sm:p-6">
              <Empty>Nothing scheduled.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sessions.map((s, i) => (
                <li
                  key={i}
                  className="group flex flex-col gap-3 p-4 transition-colors duration-200 hover:bg-violet-50/40 sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors duration-200 ${
                        s.routine.status === "cancelled"
                          ? "bg-rose-50 text-rose-600 ring-rose-100"
                          : "bg-violet-50 text-violet-700 ring-violet-100 group-hover:bg-violet-100"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect x="3.5" y="5" width="17" height="15" rx="2" />
                        <path
                          d="M7.5 3v4M16.5 3v4M3.5 10h17"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500">
                        {formatDate(s.date)}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <h3
                          className={`break-words font-bold ${
                            s.routine.status === "cancelled"
                              ? "text-slate-400 line-through"
                              : "text-slate-800 group-hover:text-violet-700"
                          }`}
                        >
                          {s.routine.subject}
                        </h3>

                        {s.routine.status === "cancelled" && (
                          <Badge value="cancelled" />
                        )}
                      </div>

                      {s.routine.note && (
                        <p className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                          {s.routine.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center pl-[52px]">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold sm:text-sm ${
                        s.routine.status === "cancelled"
                          ? "border-rose-100 bg-rose-50 text-rose-600"
                          : "border-violet-100 bg-violet-50/80 text-violet-700"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" strokeLinecap="round" />
                      </svg>
                      {formatTime(s.routine.startTime)}–
                      {formatTime(s.routine.endTime)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
