
import { PageHeader, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { BatchFilter } from "./BatchFilter";
import { AttendanceSheet } from "./AttendanceSheet";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { cn, formatDate, joinMonth, monthStr, pct, todayStr } from "@/lib/utils";
import { User } from "@/models/User";
import { Attendance } from "@/models/Attendance";

function SectionHeading({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">
          {eyebrow}
        </p>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>

      {count !== undefined && (
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-700">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {count} records
        </span>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: number | string;
  description: string;
  tone: "emerald" | "amber" | "rose" | "indigo";
}) {
  const styles = {
    emerald: {
      icon: "bg-emerald-100 text-emerald-700",
      glow: "from-emerald-100/60",
      dot: "bg-emerald-500",
    },
    amber: {
      icon: "bg-amber-100 text-amber-700",
      glow: "from-amber-100/60",
      dot: "bg-amber-500",
    },
    rose: {
      icon: "bg-rose-100 text-rose-700",
      glow: "from-rose-100/60",
      dot: "bg-rose-500",
    },
    indigo: {
      icon: "bg-indigo-100 text-indigo-700",
      glow: "from-indigo-100/60",
      dot: "bg-indigo-500",
    },
  }[tone];

  return (
    <div className="group relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_40px_-28px_rgba(79,70,229,0.3)] sm:p-5">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-10 -z-10 h-28 w-28 rounded-full bg-gradient-to-br ${styles.glow} to-transparent blur-2xl transition-transform duration-500 group-hover:scale-125`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {value}
          </p>
        </div>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon} transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110`}
        >
          <span className={`h-3 w-3 rounded-full ${styles.dot}`} />
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

/** Mark attendance per batch/date, bulk mark present, review history and monthly report. */
export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;

  await connectDB();

  const batches = await batchesFor(user);
  const batch = batches.find((b) => String(b._id) === sp.batch);

  const date =
    sp.date &&
    /^\d{4}-\d{2}-\d{2}$/.test(sp.date) &&
    sp.date <= todayStr()
      ? sp.date
      : todayStr();

  const month = date.slice(0, 7) || monthStr();

  let body: React.ReactNode = (
    <div className="rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 px-5 py-12 shadow-sm sm:px-8">
      <Empty>Select a batch and date to take attendance.</Empty>
    </div>
  );

  if (batch) {
    const students = await User.find({
      role: "student",
      status: "active",
      batchId: batch._id,
    })
      .sort({ name: 1 })
      .lean();

    const [today, monthDocs, recent] = await Promise.all([
      Attendance.findOne({ batchId: batch._id, date }).lean(),
      Attendance.find({
        batchId: batch._id,
        date: { $regex: `^${month}` },
      }).lean(),
      Attendance.find({ batchId: batch._id })
        .sort({ date: -1 })
        .limit(10)
        .lean(),
    ]);

    const prev = new Map(
      (today?.records ?? []).map((r) => [
        String(r.studentId),
        r.status,
      ]),
    );

    const sheet = students.map((s) => ({
      id: String(s._id),
      name: s.name,
      studentId: s.studentId ?? "",
      status: prev.get(String(s._id)) ?? "present",
    }));

    const monthly = students
      .filter((s) => joinMonth(s.createdAt) <= month)
      .map((s) => {
        let attended = 0;
        let total = 0;

        for (const d of monthDocs) {
          const r = d.records.find(
            (x) => String(x.studentId) === String(s._id),
          );

          if (r) {
            total++;
            if (r.status !== "absent") attended++;
          }
        }

        return {
          id: String(s._id),
          name: s.name,
          attended,
          total,
          percent: pct(attended, total),
        };
      });

    const totals = (today?.records ?? []).reduce(
      (acc, r) => {
        if (r.status === "present") acc.present++;
        else if (r.status === "late") acc.late++;
        else if (r.status === "absent") acc.absent++;
        return acc;
      },
      { present: 0, late: 0, absent: 0 },
    );

    body = (
      <div className="space-y-8">
        {/* Attendance sheet */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.3)]">
          <div className="relative overflow-hidden border-b border-indigo-100/70 bg-gradient-to-r from-indigo-50 via-white to-violet-50/70 px-4 py-5 sm:px-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl"
            />

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">
                  Attendance session
                </p>

                <h2 className="break-words text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {batch.name}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(date)}
                </p>
              </div>

              {today ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge value="active" />
                  <span className="text-xs leading-5 text-slate-500">
                    Already taken · Editing keeps a history
                  </span>
                </div>
              ) : (
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Not marked yet
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {today && (
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Present"
                  value={totals.present}
                  description="Students marked present"
                  tone="emerald"
                />
                <MetricCard
                  label="Late"
                  value={totals.late}
                  description="Students arriving late"
                  tone="amber"
                />
                <MetricCard
                  label="Absent"
                  value={totals.absent}
                  description="Students marked absent"
                  tone="rose"
                />
              </div>
            )}

            {students.length === 0 ? (
              <Empty>No active students in this batch yet.</Empty>
            ) : (
              <AttendanceSheet
                key={`${batch._id}-${date}`}
                batchId={String(batch._id)}
                date={date}
                students={sheet}
                existing={!!today}
              />
            )}
          </div>
        </section>

        {/* Recent attendance sessions */}
        <section>
          <SectionHeading
            eyebrow="Attendance history"
            title="Recent sessions"
            description="Review attendance records and previous corrections."
            count={recent.length}
          />

          {recent.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
              <Empty>No attendance recorded yet.</Empty>
            </div>
          ) : (
            <TableWrap>
              <thead className="bg-gradient-to-r from-indigo-50/80 to-violet-50/60">
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Present</th>
                  <th className="th">Late</th>
                  <th className="th">Absent</th>
                  <th className="th">Corrections</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recent.map((d) => (
                  <tr
                    key={d.date}
                    className="transition-colors duration-200 hover:bg-indigo-50/40"
                  >
                    <td className="td">
                      <a
                        className="inline-flex items-center gap-2 font-semibold text-indigo-600 transition-colors hover:text-violet-700 hover:underline"
                        href={`?batch=${batch._id}&date=${d.date}`}
                      >
                        {formatDate(d.date)}
                      </a>
                    </td>

                    <td className="td">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-emerald-50 px-2 py-1 font-bold text-emerald-700">
                        {d.records.filter((r) => r.status === "present").length}
                      </span>
                    </td>

                    <td className="td">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-amber-50 px-2 py-1 font-bold text-amber-700">
                        {d.records.filter((r) => r.status === "late").length}
                      </span>
                    </td>

                    <td className="td">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-rose-50 px-2 py-1 font-bold text-rose-700">
                        {d.records.filter((r) => r.status === "absent").length}
                      </span>
                    </td>

                    <td className="td text-xs leading-5 text-slate-500">
                      {d.history.length
                        ? `${d.history.length} edit(s), last by ${d.history[d.history.length - 1].byName}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </section>

        {/* Monthly report */}
        <section>
          <SectionHeading
            eyebrow="Monthly overview"
            title={`Monthly report — ${month}`}
            description="Track each student's attendance rate for this month."
            count={monthly.length}
          />

          <TableWrap>
            <thead className="bg-gradient-to-r from-indigo-50/80 to-violet-50/60">
              <tr>
                <th className="th">Student</th>
                <th className="th">Attended</th>
                <th className="th">Sessions</th>
                <th className="th">Attendance rate</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {monthly.map((m) => (
                <tr
                  key={m.id}
                  className="transition-colors duration-200 hover:bg-indigo-50/40"
                >
                  <td className="td font-semibold text-slate-800">
                    {m.name}
                  </td>

                  <td className="td font-medium text-emerald-700">
                    {m.attended}
                  </td>

                  <td className="td">{m.total}</td>

                  <td className="td">
                    {m.total ? (
                      <div className="flex min-w-28 items-center gap-3">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100 sm:w-24">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              m.percent < 75
                                ? "bg-gradient-to-r from-rose-500 to-red-500"
                                : "bg-gradient-to-r from-indigo-500 to-violet-500",
                            )}
                            style={{
                              width: `${Math.max(0, Math.min(100, m.percent))}%`,
                            }}
                          />
                        </div>

                        <span
                          className={cn(
                            "font-bold tabular-nums",
                            m.percent < 75
                              ? "text-rose-600"
                              : "text-slate-700",
                          )}
                        >
                          {m.percent}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </section>
      </div>
    );
  }

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/20 blur-3xl"
      />

      <PageHeader
        title="Attendance"
        subtitle="Present, Absent or Late — per batch and date"
      >
        <BatchFilter
          batches={batches}
          selected={sp.batch}
          label="Open"
        >
          <label className="block">
            <span className="label">Date</span>
            <input
              type="date"
              name="date"
              max={todayStr()}
              defaultValue={date}
              className="input"
            />
          </label>
        </BatchFilter>
      </PageHeader>

      {batches.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 px-5 py-10">
          <Empty>You have no active batches yet.</Empty>
        </div>
      ) : (
        body
      )}
    </div>
  );
}
