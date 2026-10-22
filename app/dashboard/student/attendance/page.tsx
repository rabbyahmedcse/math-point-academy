
import { PageHeader, StatCard, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { studentAttendance } from "@/lib/stats";
import { formatDate } from "@/lib/utils";

/** Read-only: students can never write attendance. */
export default async function StudentAttendance() {
  const user = await requireRole(["student"]);
  await connectDB();
  const a = await studentAttendance(user.id);
  const count = (s: string) => a.rows.filter((r) => r.status === s).length;

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-72 -z-10 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl"
      />

      {/* Page header */}
      <section className="rounded-3xl border border-white/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-lg shadow-indigo-950/[0.04] sm:p-7">
        <PageHeader
          title="My attendance"
          subtitle="Late counts as attended"
        />

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Attendance Overview
        </div>
      </section>

      {/* Attendance statistics */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Attendance Summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review your class attendance at a glance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Overall attendance */}
          <div className="group rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/90 via-white to-white p-1 shadow-md shadow-indigo-950/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="flex items-center justify-between gap-3 px-4 pt-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 2.5 2.5L16 9" />
                </svg>
              </div>
              <span className="rounded-full border border-indigo-100 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                Overall
              </span>
            </div>

            <StatCard
              label="Attendance"
              value={`${a.percent}%`}
              tone={a.total && a.percent < 75 ? "red" : "green"}
            />

            <div className="px-4 pb-4">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Attendance rate</span>
                <span>{a.percent}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100 shadow-inner"
                role="progressbar"
                aria-label="Attendance rate"
                aria-valuenow={Math.max(0, Math.min(100, a.percent))}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    a.total && a.percent < 75
                      ? "bg-gradient-to-r from-rose-400 to-red-500"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500"
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, a.percent))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Present */}
          <div className="group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white to-white p-1 shadow-md shadow-emerald-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
            <div className="flex items-center justify-between gap-3 px-4 pt-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:rotate-[4deg] group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>
              <span className="rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                Attended
              </span>
            </div>

            <StatCard label="Present" value={count("present")} tone="green" />
            <p className="px-4 pb-4 text-xs text-slate-500">
              Classes attended on time.
            </p>
          </div>

          {/* Late */}
          <div className="group rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/90 via-white to-white p-1 shadow-md shadow-amber-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10">
            <div className="flex items-center justify-between gap-3 px-4 pt-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20 transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <span className="rounded-full border border-amber-100 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                Late arrival
              </span>
            </div>

            <StatCard label="Late" value={count("late")} tone="amber" />
            <p className="px-4 pb-4 text-xs text-slate-500">
              Late arrivals count as attended.
            </p>
          </div>

          {/* Absent */}
          <div className="group rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/90 via-white to-white p-1 shadow-md shadow-rose-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10">
            <div className="flex items-center justify-between gap-3 px-4 pt-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20 transition-transform duration-300 group-hover:rotate-[4deg] group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 9 6 6m0-6-6 6" />
                </svg>
              </div>
              <span className="rounded-full border border-rose-100 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                Not attended
              </span>
            </div>

            <StatCard label="Absent" value={count("absent")} tone="red" />
            <p className="px-4 pb-4 text-xs text-slate-500">
              Classes marked as absent.
            </p>
          </div>
        </div>
      </section>

      {/* Attendance history */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo-950/[0.06]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="3" />
                  <path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  Attendance History
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your recorded class attendance
                </p>
              </div>
            </div>

            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
              {a.rows.length} record{a.rows.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {a.rows.length === 0 ? (
          <div className="p-6 text-center sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl shadow-inner">
              📅
            </div>
            <Empty>No attendance recorded yet.</Empty>
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto p-3 sm:p-5">
            <TableWrap>
              <thead className="bg-slate-50">
                <tr>
                  <th className="th whitespace-nowrap">Date</th>
                  <th className="th whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {a.rows.map((r) => (
                  <tr
                    key={r.date}
                    className="transition-colors duration-200 hover:bg-indigo-50/50"
                  >
                    <td className="td whitespace-nowrap font-medium text-slate-700">
                      {formatDate(r.date)}
                    </td>
                    <td className="td whitespace-nowrap">
                      <Badge value={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}
      </section>
    </div>
  );
}
