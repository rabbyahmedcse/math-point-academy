
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ExamResult = {
  name: string;
  marks: number | null;
  fullMarks: number;
};

export function MarksComparisonChart({
  results,
}: {
  results: ExamResult[];
}) {
  const data = results.map((exam) => ({
    exam: exam.name,
    marks: exam.marks ?? 0,
    fullMarks: exam.fullMarks,
  }));

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/70">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 19V5M4 19h17" strokeLinecap="round" />
              <path
                d="M7 15h3V9H7zM13 15h3V5h-3z"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h2 className="font-bold text-slate-800 sm:text-lg">
              Marks vs Full Marks
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Compare your obtained marks with each exam's full marks.
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-500">
          No published results available for comparison.
        </p>
      ) : (
        <div className="h-80 w-full p-3 pt-5 sm:h-96 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
              barGap={6}
              barCategoryGap="25%"
            >
              <CartesianGrid
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="exam"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={55}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E0E7FF",
                  boxShadow: "0 8px 24px rgba(79, 70, 229, 0.08)",
                  fontSize: 12,
                }}
                cursor={{ fill: "#EEF2FF", opacity: 0.6 }}
              />

              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />

              <Bar
                dataKey="marks"
                name="Obtained Marks"
                fill="#6366F1"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="fullMarks"
                name="Full Marks"
                fill="#C4B5FD"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
