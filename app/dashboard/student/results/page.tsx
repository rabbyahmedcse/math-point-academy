
import { PageHeader, Empty, TableWrap } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { formatDate, formatTime, pct, todayStr } from "@/lib/utils";
import { Types } from "mongoose";
import { performanceOf } from "@/lib/performance";
import { Exam } from "@/models/Exam";
import { MarksComparisonChart } from "./MarksComparisonChart";

export default async function StudentResults() {
  const user = await requireRole(["student"]);
  await connectDB();

  // Schedule: upcoming exams for my batch. Results: ONLY published exams, ONLY my own row.
  const [upcoming, published] = await Promise.all([
    Exam.find({
      batchId: user.batchId,
      status: "scheduled",
      date: { $gte: todayStr() },
    })
      .sort({ date: 1 })
      .lean(),

    Exam.find(
      {
        batchId: user.batchId,
        publishStatus: "published",
        status: "scheduled",
      },
      {
        name: 1,
        subject: 1,
        date: 1,
        fullMarks: 1,
        results: {
          $elemMatch: { studentId: new Types.ObjectId(user.id) },
        },
      }
    )
      .sort({ date: -1 })
      .lean(),
  ]);

  return (
    <div className="relative isolate space-y-7 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-8 -z-10 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-4 top-96 -z-10 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"
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
              <path d="M8 3.5h8M8 7h8M6 3h12a2 2 0 0 1 2 2v16l-5-2-5 2-6-2V5a2 2 0 0 1 2-2Z" />
              <path d="m9 13 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            ACADEMIC PERFORMANCE
          </div>

          <PageHeader title="Exams & results" />

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Keep track of your upcoming exams and review your published results
            in one place.
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
                  <path d="M7.5 3v4M16.5 3v4M3.5 10h17M8 14h3M8 17h6" strokeLinecap="round" />
                </svg>
              </span>
              Exam schedule
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
                  <path d="M4 19V5M4 19h17" strokeLinecap="round" />
                  <path d="m7 15 4-4 3 2 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Results overview
            </span>
          </div>
        </div>
      </section>

      {/* Upcoming exams */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              Upcoming exams
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Check your exam dates, subjects, and full marks.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Scheduled
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-5 sm:p-7">
            <Empty>No upcoming exams.</Empty>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
            {upcoming.map((e) => (
              <li
                key={String(e._id)}
                className="group relative flex flex-col gap-3 border-b border-slate-100 p-4 transition-colors duration-200 last:border-b-0 hover:bg-indigo-50/40 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5 sm:py-4"
              >
                <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-indigo-500 to-violet-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 transition-transform duration-200 group-hover:scale-105">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <rect x="3.5" y="5" width="17" height="15" rx="2" />
                      <path d="M7.5 3v4M16.5 3v4M3.5 10h17" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words font-bold text-slate-800 transition-colors group-hover:text-indigo-700">
                      {e.name}
                    </h3>
                    <p className="mt-1 break-words text-sm text-slate-500">
                      {e.subject}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-[52px] sm:justify-end sm:pl-0">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-600 sm:text-sm">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-4 w-4 text-indigo-500"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" strokeLinecap="round" />
                    </svg>
                    {formatDate(e.date)}
                    {" "}
                    {formatTime(e.startTime)}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-2 text-xs font-semibold text-violet-700 sm:text-sm">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6H14a3 3 0 0 1 0 6H6" strokeLinecap="round" />
                    </svg>
                    {e.fullMarks} marks
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>





      {/* Published results */}
      <section className="space-y-4">
        {/* Marks Comparison Graph */}
      <MarksComparisonChart
        results={published.map((e) => ({
          name: e.name,
          marks: e.results[0]?.marks ?? null,
          fullMarks: e.fullMarks,
        }))}
      />



        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              Published results
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review your marks and performance for published exams.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Results
          </span>
        </div>

        {published.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-violet-200 bg-gradient-to-br from-white to-violet-50/50 p-5 sm:p-7">
            <Empty>No results published yet.</Empty>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-indigo-100/80 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 px-4 py-4 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/70">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M4 19V5M4 19h17" strokeLinecap="round" />
                  <path d="m7 15 4-4 3 2 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div>
                <h3 className="font-bold text-slate-800">
                  Exam performance
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Your published marks and performance records
                </p>
              </div>
            </div>

            <div className="min-w-0 p-2 sm:p-4">
              <TableWrap>
                <thead className="bg-gradient-to-r from-indigo-50/90 to-violet-50/80">
                  <tr>
                    <th className="th whitespace-nowrap">Exam</th>
                    <th className="th whitespace-nowrap">Date</th>
                    <th className="th whitespace-nowrap">Marks</th>
                    <th className="th whitespace-nowrap">%</th>
                    <th className="th whitespace-nowrap">Performance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {published.map((e) => {
                    const r = e.results[0];

                    return (
                      <tr
                        key={String(e._id)}
                        className="transition-colors duration-200 hover:bg-indigo-50/40"
                      >
                        <td className="td min-w-[150px]">
                          <b className="font-semibold text-slate-800">
                            {e.name}
                          </b>
                          <br />
                          <span className="text-xs text-slate-500">
                            {e.subject}
                          </span>
                        </td>

                        <td className="td whitespace-nowrap text-slate-600">
                          {formatDate(e.date)}
                        </td>

                        <td className="td whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {r?.marks ?? "—"}
                          </span>
                          <span className="text-slate-400">
                            {" "}/ {e.fullMarks}
                          </span>
                        </td>

                        <td className="td whitespace-nowrap">
                          {r?.marks != null ? (
                            <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                              {pct(r.marks, e.fullMarks)}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="td whitespace-nowrap">
                          {performanceOf(r?.performance) ? (
                            <span
                              className={`badge ${performanceOf(r?.performance)!.cls}`}
                            >
                              {performanceOf(r?.performance)!.label}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
