
import { Types } from "mongoose";
import { PageHeader, Empty, TableWrap, StatCard } from "@/components/ui/bits";
import { ChildPicker, NoChild } from "@/components/features/parent/ChildPicker";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { resolveChild } from "@/lib/parent-data";
import { performanceOf } from "@/lib/performance";
import { formatDate, pct } from "@/lib/utils";
import { Exam } from "@/models/Exam";

/** Published results only, and only the linked child's own marks. */
export default async function ParentResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["parent"]);
  const { children, child } = await resolveChild(user.id, (await searchParams).child);
  if (!child) return <NoChild parentId={user.id} />;
  await connectDB();

  const exams = child.batchId
    ? await Exam.find(
        {
          batchId: child.batchId,
          publishStatus: "published",
          status: "scheduled",
        },
        {
          name: 1,
          subject: 1,
          date: 1,
          fullMarks: 1,
          results: {
            $elemMatch: { studentId: new Types.ObjectId(child.id) },
          },
        }
      )
        .sort({ date: -1 })
        .lean()
    : [];

  const graded = exams.filter((e) => e.results[0]?.marks != null);

  // subject-wise average
  const bySubject = new Map<string, { sum: number; n: number }>();
  for (const e of graded) {
    const s = bySubject.get(e.subject) ?? { sum: 0, n: 0 };
    s.sum += pct(e.results[0].marks as number, e.fullMarks);
    s.n++;
    bySubject.set(e.subject, s);
  }

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

      {/* Page heading */}
      <section className="rounded-3xl border border-white/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-lg shadow-indigo-950/[0.04] sm:p-7">
        <PageHeader
          title="Exam Results"
          subtitle={`${child.name} · ${child.studentId}`}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Academic Performance
          </span>
          <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500">
            Student ID: {child.studentId}
          </span>
        </div>
      </section>

      {/* Child selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-300 hover:shadow-md sm:p-4">
        <ChildPicker
          kids={children}
          selectedId={child.id}
          basePath="/dashboard/parent/results"
        />
      </div>

      {/* Subject-wise average */}
      {bySubject.size > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Subject-wise Average
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Performance summary across graded exams.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...bySubject.entries()].map(([subject, v], index) => {
              const average = Math.round(v.sum / v.n);

              return (
                <div
                  key={subject}
                  className="group min-w-0 rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40 p-1 shadow-md shadow-indigo-950/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <div className="flex items-start justify-between gap-3 px-4 pt-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M4 19V5M4 19h17" />
                        <path d="m7 15 4-4 3 2 5-6" />
                        <path d="M15 7h4v4" />
                      </svg>
                    </div>

                    <span className="rounded-full border border-indigo-100 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                      {v.n} exam{v.n > 1 ? "s" : ""}
                    </span>
                  </div>

                  <StatCard
                    label={subject}
                    value={`${average}%`}
                    hint={`${v.n} exam${v.n > 1 ? "s" : ""}`}
                    tone="indigo"
                  />

                  <div className="px-4 pb-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Average score</span>
                      <span>{average}%</span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-slate-100 shadow-inner"
                      role="progressbar"
                      aria-label={`${subject} average`}
                      aria-valuenow={Math.max(0, Math.min(100, average))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-all duration-700"
                        style={{
                          width: `${Math.max(0, Math.min(100, average))}%`,
                          transitionDelay: `${index * 60}ms`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Published results */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.03] transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo-950/[0.06]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <rect x="4" y="3" width="16" height="18" rx="2.5" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </div>

              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  Published Results
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Exam marks and performance records
                </p>
              </div>
            </div>

            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
              {exams.length} result{exams.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="p-6 text-center sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl shadow-inner">
              📝
            </div>
            <Empty>No results published yet.</Empty>
            <p className="mt-2 text-sm text-slate-500">
              Published exam results will appear here.
            </p>
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto p-3 sm:p-5">
            <TableWrap>
              <thead className="bg-slate-50">
                <tr>
                  <th className="th whitespace-nowrap">Subject</th>
                  <th className="th whitespace-nowrap">Exam</th>
                  <th className="th whitespace-nowrap">Date</th>
                  <th className="th whitespace-nowrap">Marks</th>
                  <th className="th whitespace-nowrap">%</th>
                  <th className="th whitespace-nowrap">Performance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {exams.map((e) => {
                  const r = e.results[0];
                  const p = performanceOf(r?.performance);

                  return (
                    <tr
                      key={String(e._id)}
                      className="transition-colors duration-200 hover:bg-indigo-50/50"
                    >
                      <td className="td whitespace-nowrap font-semibold text-slate-700">
                        {e.subject}
                      </td>

                      <td className="td min-w-40 font-medium text-slate-600">
                        {e.name}
                      </td>

                      <td className="td whitespace-nowrap text-slate-500">
                        {formatDate(e.date)}
                      </td>

                      <td className="td whitespace-nowrap font-semibold text-slate-700">
                        {r?.marks ?? "—"} / {e.fullMarks}
                      </td>

                      <td className="td">
                        {r?.marks != null ? (
                          <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-700">
                            {pct(r.marks, e.fullMarks)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="td whitespace-nowrap">
                        {p ? (
                          <span className={`badge ${p.cls}`}>{p.label}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          </div>
        )}
      </section>
    </div>
  );
}
