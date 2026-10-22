
import { PageHeader, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { BatchFilter } from "./BatchFilter";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { DAYS, formatDate, formatTime, todayStr } from "@/lib/utils";
import { Routine } from "@/models/Routine";
import { User } from "@/models/User";
import {
  createRoutine,
  deleteRoutine,
  cancelClass,
  rescheduleClass,
} from "@/actions/routines";

export default async function RoutinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;

  await connectDB();

  const batches = await batchesFor(user);
  const batch = batches.find((b) => String(b._id) === sp.batch);

  const teachers =
    user.role === "admin"
      ? await User.find({ role: "teacher", status: "active" })
          .sort({ name: 1 })
          .lean()
      : [];

  const routines = batch
    ? await Routine.find({
        batchId: batch._id,
        $or: [{ kind: "weekly" }, { date: { $gte: todayStr() } }],
      })
        .sort({ dayOfWeek: 1, date: 1, startTime: 1 })
        .lean()
    : [];

  const weekly = routines.filter((r) => r.kind === "weekly");
  const oneoff = routines.filter((r) => r.kind === "oneoff");

  const row = (r: (typeof routines)[number]) => (
    <tr
      key={String(r._id)}
      className={`group transition-colors duration-200 hover:bg-indigo-50/40 ${
        r.status === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <td className="td min-w-[125px]">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              {r.kind === "weekly" ? (
                <>
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 11h18" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </>
              )}
            </svg>
          </span>
          <div>
            <p className="font-bold text-slate-800">
              {r.kind === "weekly"
                ? DAYS[r.dayOfWeek ?? 0]
                : formatDate(r.date)}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {r.kind === "weekly" ? "Weekly class" : "Extra class"}
            </p>
          </div>
        </div>
      </td>

      <td className="td min-w-[145px]">
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 text-indigo-500"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span className="whitespace-nowrap text-xs font-bold text-slate-700">
            {formatTime(r.startTime)} – {formatTime(r.endTime)}
          </span>
        </div>
      </td>

      <td className="td min-w-[180px]">
        <p className="font-bold text-slate-800">{r.subject}</p>
        <p className="mt-1 whitespace-normal break-words text-xs leading-5 text-slate-500">
          {r.location}
          {r.note ? ` · ${r.note}` : ""}
        </p>
      </td>

      <td className="td min-w-[110px]">
        <Badge value={r.status} />
      </td>

      <td className="td min-w-[100px]">
        {r.status === "scheduled" && (
          <details className="group/actions relative">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 [&::-webkit-details-marker]:hidden">
              Manage
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 transition-transform group-open/actions:rotate-180"
                aria-hidden="true"
              >
                <path d="m5 7 5 5 5-5" />
              </svg>
            </summary>

            <div className="mt-2 w-[min(19rem,calc(100vw-3rem))] space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:w-80">
              <div>
                <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-rose-600">
                  Cancel class
                </p>
                <ActionForm
                  action={cancelClass}
                  submitLabel="Cancel class"
                  submitClassName="btn btn-danger btn-sm"
                  className="space-y-3"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={String(r._id)}
                  />

                  {r.kind === "weekly" && (
                    <Field label="Date to cancel">
                      <input
                        type="date"
                        name="date"
                        required
                        className="input"
                      />
                    </Field>
                  )}

                  <input
                    name="reason"
                    placeholder="Reason (shown to students)"
                    className="input"
                  />
                </ActionForm>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                  Reschedule class
                </p>

                <ActionForm
                  action={rescheduleClass}
                  submitLabel="Reschedule"
                  submitClassName="btn btn-secondary btn-sm"
                  className="space-y-3"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={String(r._id)}
                  />

                  {r.kind === "weekly" && (
                    <Field label="Original date">
                      <input
                        type="date"
                        name="fromDate"
                        required
                        className="input"
                      />
                    </Field>
                  )}

                  <Field label="New date">
                    <input
                      type="date"
                      name="newDate"
                      required
                      defaultValue={todayStr()}
                      className="input"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start">
                      <input
                        type="time"
                        name="startTime"
                        required
                        defaultValue={r.startTime}
                        className="input"
                      />
                    </Field>

                    <Field label="End">
                      <input
                        type="time"
                        name="endTime"
                        required
                        defaultValue={r.endTime}
                        className="input"
                      />
                    </Field>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-xs leading-5 text-amber-800">
                    <input
                      type="checkbox"
                      name="force"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                    />
                    <span>
                      Save anyway if teacher has a conflict
                    </span>
                  </label>
                </ActionForm>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <ActionForm
                  action={deleteRoutine}
                  submitLabel="Remove entry"
                  submitClassName="btn btn-secondary btn-sm"
                  className=""
                >
                  <input
                    type="hidden"
                    name="id"
                    value={String(r._id)}
                  />
                </ActionForm>
              </div>
            </div>
          </details>
        )}
      </td>
    </tr>
  );

  const head = (
    <thead className="bg-slate-50/90">
      <tr>
        <th className="th">When</th>
        <th className="th">Time</th>
        <th className="th">Subject & location</th>
        <th className="th">Status</th>
        <th className="th">Actions</th>
      </tr>
    </thead>
  );

  return (
    <main className="relative isolate min-w-0 space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-0 -z-10 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-80 -z-10 h-56 w-56 rounded-full bg-violet-200/20 blur-3xl"
      />

      {/* Page heading */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-[0_16px_50px_-35px_rgba(79,70,229,0.35)] sm:p-7 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full border-[24px] border-indigo-100/40 sm:h-64 sm:w-64"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 hover:rotate-3 hover:scale-105 sm:h-16 sm:w-16">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 sm:h-8 sm:w-8"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18M8 14h3M8 17h6" />
              </svg>
            </div>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Academic schedule
              </span>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Class <span className="text-indigo-600">Routine</span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage weekly schedules, extra classes, cancellations and
                rescheduled sessions in one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Weekly classes
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  Extra sessions
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-3 rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur-md sm:self-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 8v6M17 11h6" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Batch selection
              </p>
              <div className="mt-1">
                <BatchFilter
                  batches={batches}
                  selected={sp.batch}
                  label="Open batch"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!batch ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          <Empty>Select a batch to manage its routine.</Empty>
        </div>
      ) : (
        <div className="space-y-7">
          {/* Selected batch */}
          <section className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-white/85 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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
                  <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                  <path d="M8 9v.01M8 12v.01M8 15v.01M16 13v.01M16 16v.01" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                  Selected batch
                </p>
                <h2 className="mt-0.5 break-words text-lg font-black text-slate-900">
                  {batch.name}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {weekly.length} weekly{" "}
                  {weekly.length === 1 ? "class" : "classes"} ·{" "}
                  {oneoff.length} upcoming extra{" "}
                  {oneoff.length === 1 ? "class" : "classes"}
                </p>
              </div>
            </div>

            <details className="group/add relative">
              <summary className="inline-flex min-h-11 w-full cursor-pointer list-none items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 sm:w-auto [&::-webkit-details-marker]:hidden">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-4 w-4 transition-transform duration-300 group-open/add:rotate-45"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add class
              </summary>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:absolute sm:right-0 sm:z-30 sm:w-[min(42rem,calc(100vw-3rem))] sm:p-5">
                <div className="mb-5">
                  <h3 className="text-base font-black text-slate-900">
                    Add to routine
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Configure the class schedule and its details below.
                  </p>
                </div>

                <ActionForm
                  action={createRoutine}
                  submitLabel="Add to routine"
                  className="space-y-4"
                >
                  <input
                    type="hidden"
                    name="batchId"
                    value={String(batch._id)}
                  />

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Class type">
                      <select
                        name="kind"
                        className="input"
                        defaultValue="weekly"
                      >
                        <option value="weekly">Weekly (repeats)</option>
                        <option value="oneoff">One-off / extra class</option>
                      </select>
                    </Field>

                    <Field label="Weekday (weekly)">
                      <select
                        name="dayOfWeek"
                        className="input"
                        defaultValue="0"
                      >
                        {DAYS.map((d, i) => (
                          <option key={d} value={i}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Date (one-off)">
                      <input
                        type="date"
                        name="date"
                        className="input"
                      />
                    </Field>

                    <Field label="Start time">
                      <input
                        type="time"
                        name="startTime"
                        required
                        className="input"
                      />
                    </Field>

                    <Field label="End time">
                      <input
                        type="time"
                        name="endTime"
                        required
                        className="input"
                      />
                    </Field>

                    <Field label="Subject">
                      <input
                        name="subject"
                        required
                        defaultValue={batch.subject}
                        className="input"
                        placeholder="Class subject"
                      />
                    </Field>

                    <Field label="Location">
                      <input
                        name="location"
                        className="input"
                        placeholder="Room 2"
                      />
                    </Field>

                    {user.role === "admin" && (
                      <Field label="Teacher">
                        <select
                          name="teacherId"
                          className="input"
                          defaultValue=""
                        >
                          <option value="">Batch teacher</option>
                          {teachers.map((t) => (
                            <option
                              key={String(t._id)}
                              value={String(t._id)}
                            >
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-xs leading-5 text-amber-800">
                    <input
                      type="checkbox"
                      name="force"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                    />
                    <span>
                      Save anyway if the teacher already has a class at this
                      time.
                    </span>
                  </label>
                </ActionForm>
              </div>
            </details>
          </section>

          {/* Weekly schedule */}
          <RoutineSection
            title="Weekly routine"
            subtitle="Classes that repeat every week"
            count={weekly.length}
            accent="indigo"
          >
            {weekly.length ? (
              <TableWrap>
                {head}
                <tbody className="divide-y divide-slate-100">
                  {weekly.map(row)}
                </tbody>
              </TableWrap>
            ) : (
              <Empty>No weekly classes yet.</Empty>
            )}
          </RoutineSection>

          {/* One-off schedule */}
          <RoutineSection
            title="Upcoming extra classes"
            subtitle="One-off and rescheduled sessions"
            count={oneoff.length}
            accent="violet"
          >
            {oneoff.length ? (
              <TableWrap>
                {head}
                <tbody className="divide-y divide-slate-100">
                  {oneoff.map(row)}
                </tbody>
              </TableWrap>
            ) : (
              <Empty>Nothing scheduled.</Empty>
            )}
          </RoutineSection>
        </div>
      )}
    </main>
  );
}

function RoutineSection({
  title,
  subtitle,
  count,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  accent: "indigo" | "violet";
  children: React.ReactNode;
}) {
  const accentStyles =
    accent === "indigo"
      ? {
          bar: "bg-indigo-500",
          badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
        }
      : {
          bar: "bg-violet-500",
          badge: "border-violet-100 bg-violet-50 text-violet-700",
        };

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div className="flex items-start gap-3">
          <span className={`mt-1 h-9 w-1 rounded-full ${accentStyles.bar}`} />
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              {title}
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${accentStyles.badge}`}
        >
          {count} {count === 1 ? "class" : "classes"}
        </span>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-md hover:shadow-indigo-500/[0.04]">
        {children}
      </div>
    </section>
  );
}
