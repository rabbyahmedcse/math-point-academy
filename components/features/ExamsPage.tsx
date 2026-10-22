
import Link from "next/link";
import {
  PageHeader,
  Empty,
  Badge,
  TableWrap,
} from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { BatchFilter } from "./BatchFilter";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor, batchScope } from "@/lib/access";
import { formatDate, formatTime, todayStr } from "@/lib/utils";
import { PERFORMANCE_LEVELS } from "@/lib/performance";
import { Exam } from "@/models/Exam";
import { User } from "@/models/User";
import { Batch } from "@/models/Batch";
import {
  createExam,
  cancelExam,
  saveMarks,
  publishResult,
  unpublishResult,
} from "@/actions/exams";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;

  await connectDB();

  const batches = await batchesFor(user);
  const allMine = await Batch.find(batchScope(user), {
    _id: 1,
    name: 1,
  }).lean();

  const names = new Map(allMine.map((b) => [String(b._id), b.name]));

  const exams = await Exam.find({
    batchId: { $in: allMine.map((b) => b._id) },
    ...(sp.batch ? { batchId: sp.batch } : {}),
  })
    .sort({ date: -1 })
    .limit(50)
    .lean();

  const selected = exams.find((e) => String(e._id) === sp.exam);

  const students = selected
    ? await User.find({
        role: "student",
        status: "active",
        batchId: selected.batchId,
      })
        .sort({ name: 1 })
        .lean()
    : [];

  const marks = new Map(
    (selected?.results ?? []).map((r) => [String(r.studentId), r])
  );

  const totalExams = exams.length;
  const publishedCount = exams.filter(
    (e) => e.publishStatus === "published"
  ).length;
  const cancelledCount = exams.filter(
    (e) => e.status === "cancelled"
  ).length;
  const draftCount = exams.filter(
    (e) => e.publishStatus !== "published" && e.status !== "cancelled"
  ).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="relative isolate overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50/70 p-5 shadow-[0_16px_50px_-35px_rgba(79,70,229,0.35)] sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full border-[24px] border-indigo-100/40"
        />

        <div className="relative flex flex-col gap-5">
          <PageHeader
            title="Exams & results"
            subtitle="Schedule exams, enter marks, publish results"
          >
            <BatchFilter
              batches={batches}
              selected={sp.batch}
              label="Filter"
            />
          </PageHeader>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Exam management
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Results & marks
            </span>
          </div>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 sm:p-5">
          <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-indigo-100/60 blur-2xl transition-transform duration-300 group-hover:scale-150" />
          <div className="relative flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:text-sm">
              Total exams
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <p className="relative mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {totalExams}
          </p>
          <p className="relative mt-1 text-xs text-slate-500">In your accessible batches</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 sm:p-5">
          <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-emerald-100/60 blur-2xl transition-transform duration-300 group-hover:scale-150" />
          <div className="relative flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:text-sm">
              Published
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </span>
          </div>
          <p className="relative mt-3 text-3xl font-black tracking-tight text-emerald-700 sm:text-4xl">
            {publishedCount}
          </p>
          <p className="relative mt-1 text-xs text-slate-500">Results released</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 sm:p-5">
          <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-amber-100/60 blur-2xl transition-transform duration-300 group-hover:scale-150" />
          <div className="relative flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:text-sm">
              Drafts
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
          </div>
          <p className="relative mt-3 text-3xl font-black tracking-tight text-amber-700 sm:text-4xl">
            {draftCount}
          </p>
          <p className="relative mt-1 text-xs text-slate-500">Awaiting publication</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 sm:p-5">
          <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-rose-100/60 blur-2xl transition-transform duration-300 group-hover:scale-150" />
          <div className="relative flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:text-sm">
              Cancelled
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path d="m9 9 6 6m0-6-6 6" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
          </div>
          <p className="relative mt-3 text-3xl font-black tracking-tight text-rose-700 sm:text-4xl">
            {cancelledCount}
          </p>
          <p className="relative mt-1 text-xs text-slate-500">Cancelled exams</p>
        </div>
      </div>

      {/* Create exam */}
      <details className="group overflow-hidden rounded-2xl border border-indigo-100/80 bg-white shadow-sm transition-all duration-300 open:shadow-lg open:shadow-indigo-500/5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-gradient-to-r from-white via-indigo-50/50 to-violet-50/60 px-5 py-4 transition-colors hover:from-indigo-50 hover:to-violet-50 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 group-open:rotate-90">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block font-extrabold text-slate-900">Create a new exam</span>
              <span className="mt-0.5 block text-xs text-slate-500 sm:text-sm">
                Set the batch, subject, schedule and full marks
              </span>
            </span>
          </div>

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180" aria-hidden="true">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>

        <div className="border-t border-slate-100 p-4 sm:p-6">
          <ActionForm action={createExam} submitLabel="Create exam" className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Batch">
                <select name="batchId" required defaultValue="" className="input">
                  <option value="" disabled>Select…</option>
                  {batches.map((b) => (
                    <option key={String(b._id)} value={String(b._id)}>{b.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Exam name">
                <input name="name" required className="input" placeholder="Monthly test 3" />
              </Field>

              <Field label="Subject">
                <input name="subject" required className="input" placeholder="e.g. Mathematics" />
              </Field>

              <Field label="Date">
                <input type="date" name="date" required defaultValue={todayStr()} className="input" />
              </Field>

              <Field label="Start time">
                <input type="time" name="startTime" className="input" />
              </Field>

              <Field label="Full marks">
                <input type="number" name="fullMarks" min={1} required defaultValue={100} className="input" />
              </Field>
            </div>
          </ActionForm>
        </div>
      </details>

      {/* Exams list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-white via-indigo-50/30 to-violet-50/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Exam schedule</h2>
            <p className="mt-1 text-sm text-slate-500">Select an exam to enter or manage student marks.</p>
          </div>
          <span className="w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {totalExams} exams
          </span>
        </div>

        {exams.length === 0 ? (
          <div className="p-5 sm:p-8">
            <Empty>No exams yet.</Empty>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
              {exams.map((e) => (
                <article
                  key={String(e._id)}
                  className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    String(e._id) === sp.exam
                      ? "border-indigo-300 bg-indigo-50/60 shadow-sm shadow-indigo-500/5"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-bold text-slate-900">{e.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{e.subject}</p>
                    </div>
                    <Badge value={e.status === "cancelled" ? "cancelled" : e.publishStatus === "published" ? "published" : "draft"} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Batch</p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-700">{names.get(String(e.batchId))}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full marks</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">{e.fullMarks}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {formatDate(e.date)} {formatTime(e.startTime)}
                  </p>

                  <Link
                    className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md"
                    href={`?${sp.batch ? `batch=${encodeURIComponent(sp.batch)}&` : ""}exam=${e._id}`}
                  >
                    Manage marks
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block">
              <TableWrap>
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="th">Exam</th>
                    <th className="th">Batch</th>
                    <th className="th">Date</th>
                    <th className="th">Marks</th>
                    <th className="th">Status</th>
                    <th className="th">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((e) => (
                    <tr
                      key={String(e._id)}
                      className={`transition-colors hover:bg-indigo-50/40 ${
                        String(e._id) === sp.exam ? "bg-indigo-50/60" : ""
                      }`}
                    >
                      <td className="td">
                        <p className="font-bold text-slate-800">{e.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{e.subject}</p>
                      </td>
                      <td className="td">{names.get(String(e.batchId))}</td>
                      <td className="td">
                        <p className="whitespace-nowrap font-medium text-slate-700">{formatDate(e.date)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{formatTime(e.startTime)}</p>
                      </td>
                      <td className="td font-semibold text-slate-700">{e.fullMarks}</td>
                      <td className="td">
                        {e.status === "cancelled" ? (
                          <Badge value="cancelled" />
                        ) : (
                          <Badge value={e.publishStatus === "published" ? "published" : "draft"} />
                        )}
                      </td>
                      <td className="td">
                        <Link
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-sm"
                          href={`?${sp.batch ? `batch=${encodeURIComponent(sp.batch)}&` : ""}exam=${e._id}`}
                        >
                          Marks
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                            <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          </>
        )}
      </section>

      {/* Selected exam / marks management */}
      {selected && (
        <section className="overflow-hidden rounded-3xl border border-indigo-100/80 bg-white shadow-[0_18px_55px_-35px_rgba(79,70,229,0.3)]">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-400" />

          <div className="border-b border-slate-100 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                    <path d="M8 4h8M8 8h8M8 12h5M6 2h12a2 2 0 0 1 2 2v16l-8-4-8 4V4a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">Marks management</p>
                  <h2 className="mt-1 break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {selected.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {selected.subject} · Out of {selected.fullMarks} marks
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.status !== "cancelled" && selected.publishStatus !== "published" && (
                  <ActionForm action={publishResult} hideSubmit resetOnSuccess={false}>
                    <input type="hidden" name="examId" value={String(selected._id)} />
                    <button className="btn btn-primary btn-sm">Publish result</button>
                  </ActionForm>
                )}

                {selected.publishStatus === "published" && (
                  <ActionForm action={unpublishResult} hideSubmit resetOnSuccess={false}>
                    <input type="hidden" name="examId" value={String(selected._id)} />
                    <button className="btn btn-secondary btn-sm">Unpublish</button>
                  </ActionForm>
                )}

                {selected.status !== "cancelled" && (
                  <ActionForm action={cancelExam} hideSubmit resetOnSuccess={false}>
                    <input type="hidden" name="examId" value={String(selected._id)} />
                    <button className="btn btn-danger btn-sm">Cancel exam</button>
                  </ActionForm>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            {selected.publishStatus === "published" && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <p>
                  <span className="font-extrabold">Results published.</span>{" "}
                  You can still correct marks or performance. Students see changes immediately, and edits are saved in the audit history.
                </p>
              </div>
            )}

            {students.length === 0 ? (
              <Empty>No active students in this batch.</Empty>
            ) : (
              <ActionForm action={saveMarks} submitLabel="Save marks" resetOnSuccess={false}>
                <input type="hidden" name="examId" value={String(selected._id)} />

                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900">Student marks</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Enter each student's marks and performance level.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                    {students.length} students
                  </span>
                </div>

                {/* Mobile student cards */}
                <div className="grid gap-3 md:hidden">
                  {students.map((s) => (
                    <div key={String(s._id)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-black text-indigo-700">
                          {s.name?.trim()?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-bold text-slate-900">{s.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{s.studentId}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label={`Marks (max ${selected.fullMarks})`}>
                          <input
                            name={`marks:${s._id}`}
                            type="number"
                            step="0.5"
                            min={0}
                            max={selected.fullMarks}
                            defaultValue={marks.get(String(s._id))?.marks ?? ""}
                            className="input w-full"
                          />
                        </Field>

                        <Field label="Performance">
                          <select
                            name={`performance:${s._id}`}
                            defaultValue={marks.get(String(s._id))?.performance ?? ""}
                            className="input w-full"
                          >
                            <option value="">— Select —</option>
                            {PERFORMANCE_LEVELS.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet and desktop table */}
                <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="th">Student</th>
                        <th className="th">Marks</th>
                        <th className="th">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s) => (
                        <tr key={String(s._id)} className="transition-colors hover:bg-indigo-50/30">
                          <td className="td">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700">
                                {s.name?.trim()?.charAt(0)?.toUpperCase() || "S"}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800">{s.name}</p>
                                <p className="text-xs text-slate-500">{s.studentId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="td">
                            <input
                              name={`marks:${s._id}`}
                              type="number"
                              step="0.5"
                              min={0}
                              max={selected.fullMarks}
                              defaultValue={marks.get(String(s._id))?.marks ?? ""}
                              className="input w-28"
                            />
                          </td>
                          <td className="td">
                            <select
                              name={`performance:${s._id}`}
                              defaultValue={marks.get(String(s._id))?.performance ?? ""}
                              className="input w-44"
                            >
                              <option value="">— Select —</option>
                              {PERFORMANCE_LEVELS.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ActionForm>
            )}

            {/* Audit history */}
            {selected.audit.length > 0 && (
              <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold text-slate-700 transition-colors hover:bg-indigo-50/60 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    Audit history
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                      {selected.audit.length}
                    </span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>

                <ul className="space-y-2 border-t border-slate-200 p-4">
                  {selected.audit.slice().reverse().map((a, i) => (
                    <li key={i} className="rounded-xl border border-slate-100 bg-white p-3 text-xs leading-5 text-slate-600 sm:flex sm:flex-wrap sm:items-center sm:gap-x-2">
                      <span className="font-semibold text-slate-700">{formatDate(a.at)}</span>
                      <span className="hidden text-slate-300 sm:inline">·</span>
                      <span>{a.byName}</span>
                      <span className="hidden text-slate-300 sm:inline">·</span>
                      <span className="font-bold text-indigo-700">{a.action}</span>
                      {a.detail && <span className="break-words">— {a.detail}</span>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
