
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
    User.countDocuments({
      role: "student",
      status: "active",
      batchId: { $in: ids },
    }),
    user.permissions.approveStudents
      ? User.countDocuments({
          role: "student",
          status: "pending",
        })
      : 0,
    todaysClasses(ids),
    attendanceToday(ids),
  ]);

  return (
    <main className="relative isolate min-w-0 space-y-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-1 sm:space-y-7 sm:p-2 lg:p-3">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 -z-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-[90px] sm:h-80 sm:w-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-96 -z-10 h-72 w-72 rounded-full bg-violet-400/15 blur-[100px]"
      />

      {/* Page heading */}
      <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-indigo-950/[0.04] backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/[0.06] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-200/50 to-violet-200/30 blur-3xl"
        />

        <div className="relative">
          <PageHeader
            title={`Hello, ${user.name}`}
            subtitle="Your day at a glance"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Teacher dashboard
            </span>

            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              {classes.length} classes today
            </span>
          </div>
        </div>
      </section>

      {/* Pending registrations */}
      {pending > 0 && (
        <Link
          href="/dashboard/teacher/students"
          className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-950/[0.06] sm:p-5"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500"
          />

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-xl shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
            ⏳
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-amber-950">
              Registration review required
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              <strong>{pending}</strong> registration
              {pending > 1 ? "s" : ""} waiting for review.
            </p>
          </div>

          <span
            aria-hidden="true"
            className="shrink-0 text-lg font-bold text-amber-700 transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      )}

      {/* Dashboard statistics */}
      <section aria-label="Dashboard statistics">
        <div className="mb-4 flex items-center gap-3 px-1">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-600 to-violet-500" />
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              At a glance
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Your teaching activity and attendance overview
            </p>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <div className="min-w-0 transition-transform duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(1deg)]">
            <StatCard
              label="My batches"
              value={batches.length}
              tone="indigo"
            />
          </div>

          <div className="min-w-0 transition-transform duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(1deg)]">
            <StatCard
              label="My students"
              value={students}
            />
          </div>

          <div className="min-w-0 transition-transform duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(1deg)]">
            <StatCard
              label="Classes today"
              value={classes.length}
            />
          </div>

          <div className="min-w-0 transition-transform duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(1deg)]">
            <StatCard
              label="Marked today"
              value={`${att.present + att.late + att.absent}`}
              hint={`${att.absent} absent`}
            />
          </div>
        </div>
      </section>

      {/* Today's classes */}
      <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/[0.05] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-700 shadow-sm transition-transform duration-300 hover:rotate-3 hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                Today&apos;s classes
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Your scheduled teaching sessions
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 sm:p-8">
            <Empty>No classes today.</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            {classes.map((c, index) => (
              <li
                key={String(c._id)}
                className="group/class relative flex min-w-0 flex-col gap-3 px-3 py-4 transition-all duration-300 hover:bg-indigo-50/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
              >
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 top-0 w-1 origin-bottom scale-y-0 bg-gradient-to-b from-indigo-500 to-violet-500 transition-transform duration-300 group-hover/class:scale-y-100"
                />

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50 text-sm font-extrabold text-indigo-700 transition-all duration-300 group-hover/class:scale-105 group-hover/class:border-indigo-100 group-hover/class:shadow-md">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0">
                    <p className="break-words text-sm font-extrabold text-slate-900 sm:text-base">
                      {c.subject}
                    </p>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                      {c.batchName}
                    </p>
                  </div>
                </div>

                <div className="flex w-fit max-w-full items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2 text-xs font-bold text-indigo-700 sm:shrink-0 sm:text-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>

                  <span>
                    {formatTime(c.startTime)}–{formatTime(c.endTime)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
