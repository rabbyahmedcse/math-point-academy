
import { PageHeader, StatCard, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { ChildPicker, NoChild } from "@/components/features/parent/ChildPicker";
import { requireRole } from "@/lib/session";
import { resolveChild } from "@/lib/parent-data";
import { studentAttendance } from "@/lib/stats";
import { formatDate, formatMonth, pct } from "@/lib/utils";

export default async function ParentAttendance({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["parent"]);
  const { children, child } = await resolveChild(user.id, (await searchParams).child);
  if (!child) return <NoChild parentId={user.id} />;

  const a = await studentAttendance(child.id);
  const count = (s: string) => a.rows.filter((r) => r.status === s).length;
  const byMonth = new Map<string, { present: number; late: number; absent: number }>();

  for (const r of a.rows) {
    const m = byMonth.get(r.date.slice(0, 7)) ?? {
      present: 0,
      late: 0,
      absent: 0,
    };
    m[r.status]++;
    byMonth.set(r.date.slice(0, 7), m);
  }

  const presentCount = count("present");
  const lateCount = count("late");
  const absentCount = count("absent");

  const monthlyRows = [...byMonth.entries()];
  const maxMonthly = Math.max(
    1,
    ...monthlyRows.map(([, v]) => v.present + v.late + v.absent)
  );

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Soft background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-72 -z-10 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl"
      />

      {/* Page heading */}
      <div className="rounded-3xl border border-white/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-lg shadow-indigo-950/[0.04] sm:p-7">
        <PageHeader
          title="Attendance"
          subtitle={`${child.name} · ${child.studentId} · late counts as attended`}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Attendance Overview
          </span>
          <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500">
            Student ID: {child.studentId}
          </span>
        </div>
      </div>

      {/* Child selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-300 hover:shadow-md sm:p-4">
        <ChildPicker
          kids={children}
          selectedId={child.id}
          basePath="/dashboard/parent/attendance"
        />
      </div>

      {/* Attendance statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group transition-transform duration-300 hover:-translate-y-1">
          <div className="h-full rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/90 via-white to-white p-1 shadow-md shadow-indigo-950/[0.04] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
            <StatCard
              label="Attendance"
              value={`${a.percent}%`}
              hint={`${a.attended} of ${a.total} classes`}
              tone={a.total && a.percent < 75 ? "red" : "green"}
            />
            <div className="px-4 pb-4">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Attendance rate</span>
                <span>{a.percent}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Attendance rate"
                aria-valuenow={a.percent}
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
        </div>

        <div className="group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-1 shadow-md shadow-emerald-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
          <StatCard
            label="Present days"
            value={presentCount}
            tone="green"
          />
        </div>

        <div className="group rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-1 shadow-md shadow-amber-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10">
          <StatCard label="Late" value={lateCount} tone="amber" />
        </div>

        <div className="group rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/80 to-white p-1 shadow-md shadow-rose-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10">
          <StatCard label="Absent days" value={absentCount} tone="red" />
        </div>
      </div>

      {a.rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl shadow-inner">
            📅
          </div>
          <Empty>No attendance recorded yet.</Empty>
          <p className="mt-2 text-sm text-slate-500">
            Attendance details will appear here once they are recorded.
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          {/* Monthly attendance chart */}
          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo-950/[0.06]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg text-white shadow-lg shadow-indigo-500/25">
                  📊
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                    Month by Month
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Monthly attendance breakdown
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {monthlyRows.map(([m, v]) => {
                const total = v.present + v.late + v.absent;
                const attended = v.present + v.late;
                const percentage = pct(attended, total);

                return (
                  <div key={m} className="group/month space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-700">
                        {formatMonth(m)}
                      </span>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-700">
                        {percentage}%
                      </span>
                    </div>

                    {/* Segmented monthly chart */}
                    <div
                      className="flex h-3.5 overflow-hidden rounded-full bg-slate-100 shadow-inner"
                      role="img"
                      aria-label={`${formatMonth(m)}: ${v.present} present, ${v.late} late, ${v.absent} absent`}
                    >
                      {v.present > 0 && (
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 group-hover/month:brightness-105"
                          style={{ width: `${(v.present / total) * 100}%` }}
                        />
                      )}
                      {v.late > 0 && (
                        <div
                          className="h-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-500"
                          style={{ width: `${(v.late / total) * 100}%` }}
                        />
                      )}
                      {v.absent > 0 && (
                        <div
                          className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
                          style={{ width: `${(v.absent / total) * 100}%` }}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Present <strong className="text-slate-700">{v.present}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        Late <strong className="text-slate-700">{v.late}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        Absent <strong className="text-slate-700">{v.absent}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Monthly summary table */}
          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo-950/[0.06]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50/80 via-white to-indigo-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg text-white shadow-lg shadow-violet-500/25">
                  📈
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                    Monthly Summary
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Compare attendance by month
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0 overflow-x-auto p-3 sm:p-4">
              <TableWrap>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th whitespace-nowrap">Month</th>
                    <th className="th whitespace-nowrap">Present</th>
                    <th className="th whitespace-nowrap">Late</th>
                    <th className="th whitespace-nowrap">Absent</th>
                    <th className="th whitespace-nowrap">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyRows.map(([m, v]) => (
                    <tr
                      key={m}
                      className="transition-colors duration-200 hover:bg-indigo-50/50"
                    >
                      <td className="td whitespace-nowrap font-semibold text-slate-700">
                        {formatMonth(m)}
                      </td>
                      <td className="td font-semibold text-emerald-700">
                        {v.present}
                      </td>
                      <td className="td font-semibold text-amber-700">
                        {v.late}
                      </td>
                      <td className="td font-semibold text-rose-700">
                        {v.absent}
                      </td>
                      <td className="td">
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-700">
                          {pct(
                            v.present + v.late,
                            v.present + v.late + v.absent
                          )}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          </section>

          {/* Recent attendance */}
          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo-950/[0.06] xl:col-span-2">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/70 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-lg text-white shadow-lg shadow-sky-500/20">
                    🗓️
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                      Recent Days
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Latest attendance records
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                  Showing {Math.min(a.rows.length, 20)} records
                </span>
              </div>
            </div>

            <div className="min-w-0 overflow-x-auto p-3 sm:p-4">
              <TableWrap>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th whitespace-nowrap">Date</th>
                    <th className="th whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {a.rows.slice(0, 20).map((r) => (
                    <tr
                      key={r.date}
                      className="transition-colors duration-200 hover:bg-indigo-50/50"
                    >
                      <td className="td whitespace-nowrap font-medium text-slate-700">
                        {formatDate(r.date)}
                      </td>
                      <td className="td">
                        <Badge value={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
