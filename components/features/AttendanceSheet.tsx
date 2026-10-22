
"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { saveAttendance } from "@/actions/attendance";
import { cn } from "@/lib/utils";

type Status = "present" | "absent" | "late";

export interface SheetStudent {
  id: string;
  name: string;
  studentId: string;
  status: Status;
}

const STYLES: Record<Status, string> = {
  present:
    "border-emerald-500 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20",
  late:
    "border-amber-500 bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20",
  absent:
    "border-rose-500 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20",
};

const STATUS_STYLES: Record<Status, string> = {
  present: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  late: "bg-amber-50 text-amber-700 ring-amber-100",
  absent: "bg-rose-50 text-rose-700 ring-rose-100",
};

const STATUS_LABELS: Record<Status, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
};

/** Present / Late / Absent toggle per student, with bulk action. */
export function AttendanceSheet({
  batchId,
  date,
  students,
  existing,
}: {
  batchId: string;
  date: string;
  students: SheetStudent[];
  existing: boolean;
}) {
  const [state, setState] = useState<Record<string, Status>>(
    Object.fromEntries(students.map((s) => [s.id, s.status])),
  );

  const count = (st: Status) =>
    Object.values(state).filter((v) => v === st).length;

  const allPresent = students.every((s) => state[s.id] === "present");

  const markAllPresent = () => {
    setState(
      Object.fromEntries(
        students.map((s) => [s.id, "present" as Status]),
      ),
    );
  };

  return (
    <ActionForm
      action={saveAttendance}
      submitLabel={existing ? "Update attendance" : "Save attendance"}
      resetOnSuccess={false}
    >
      <input type="hidden" name="batchId" value={batchId} />
      <input type="hidden" name="date" value={date} />

      {students.map((s) => (
        <input
          key={s.id}
          type="hidden"
          name={`status:${s.id}`}
          value={state[s.id]}
        />
      ))}

      <div className="space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["present", "late", "absent"] as Status[]).map((st) => {
            const Icon =
              st === "present" ? (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="m4 10 4 4 8-8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : st === "late" ? (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <circle cx="10" cy="10" r="7.5" />
                  <path
                    d="M10 5.5V10l3 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="m6 6 8 8M14 6l-8 8"
                    strokeLinecap="round"
                  />
                </svg>
              );

            const tone =
              st === "present"
                ? "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-700"
                : st === "late"
                  ? "border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-700"
                  : "border-rose-100 bg-gradient-to-br from-rose-50 to-white text-rose-700";

            return (
              <div
                key={st}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                  tone,
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold opacity-80">
                      {STATUS_LABELS[st]}
                    </p>
                    <p className="mt-1 text-3xl font-extrabold tabular-nums">
                      {count(st)}
                    </p>
                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                    {Icon}
                  </span>
                </div>

                <div
                  aria-hidden="true"
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5"
                >
                  <div
                    className="h-full rounded-full bg-current opacity-70 transition-all duration-500"
                    style={{
                      width: `${students.length ? (count(st) / students.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* List heading and bulk action */}
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 sm:text-base">
              Student attendance
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Select the correct status for each student.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllPresent}
            disabled={allPresent || students.length === 0}
            className="group/mark inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:text-emerald-700"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 transition-transform duration-300 group-hover/mark:scale-110"
              aria-hidden="true"
            >
              <path
                d="m4 10 4 4 8-8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Mark all present
          </button>
        </div>

        {/* Students */}
        <ul className="space-y-3">
          {students.map((s, i) => {
            const currentStatus = state[s.id];

            return (
              <li
                key={s.id}
                className="group/student relative rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_25px_-22px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_15px_35px_-25px_rgba(79,70,229,0.3)] sm:p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Student identity */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-extrabold text-indigo-700 ring-1 ring-indigo-100 transition-transform duration-300 group-hover/student:rotate-3 group-hover/student:scale-105">
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-bold text-slate-900 sm:text-base">
                        {s.name}
                      </p>

                      <p className="mt-1 break-all font-mono text-xs text-slate-500">
                        {s.studentId || "No student ID"}
                      </p>
                    </div>
                  </div>

                  {/* Status selection */}
                  <div className="flex flex-col gap-2 sm:items-end">
                    <span
                      className={cn(
                        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1",
                        STATUS_STYLES[currentStatus],
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {STATUS_LABELS[currentStatus]}
                    </span>

                    <div
                      className="grid grid-cols-3 gap-1.5"
                      role="radiogroup"
                      aria-label={`Attendance for ${s.name}`}
                    >
                      {(["present", "late", "absent"] as Status[]).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            role="radio"
                            aria-checked={currentStatus === st}
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                [s.id]: st,
                              }))
                            }
                            className={cn(
                              "min-h-10 min-w-[76px] rounded-xl border px-3 py-2 text-xs font-bold capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200/70 sm:min-w-[84px]",
                              currentStatus === st
                                ? cn(
                                    STYLES[st],
                                    "scale-[1.02]",
                                  )
                                : "border-slate-200 bg-slate-50/80 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
                            )}
                          >
                            {st}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Bottom summary */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">
              {students.length} student{students.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Review the selected statuses before saving.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-emerald-700">
              P: {count("present")}
            </span>
            <span className="rounded-lg bg-amber-100 px-2.5 py-1.5 text-amber-700">
              L: {count("late")}
            </span>
            <span className="rounded-lg bg-rose-100 px-2.5 py-1.5 text-rose-700">
              A: {count("absent")}
            </span>
          </div>
        </div>
      </div>
    </ActionForm>
  );
}
