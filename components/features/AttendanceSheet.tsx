"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { saveAttendance } from "@/actions/attendance";
import { cn } from "@/lib/utils";

type Status = "present" | "absent" | "late";
export interface SheetStudent { id: string; name: string; studentId: string; status: Status }

const STYLES: Record<Status, string> = {
  present: "bg-emerald-600 text-white border-emerald-600",
  late: "bg-amber-500 text-white border-amber-500",
  absent: "bg-red-600 text-white border-red-600",
};

/** Present / Late / Absent toggle per student, with "mark all present" bulk action. */
export function AttendanceSheet({ batchId, date, students, existing }: { batchId: string; date: string; students: SheetStudent[]; existing: boolean }) {
  const [state, setState] = useState<Record<string, Status>>(Object.fromEntries(students.map((s) => [s.id, s.status])));
  const count = (st: Status) => Object.values(state).filter((v) => v === st).length;

  return (
    <ActionForm action={saveAttendance} submitLabel={existing ? "Update attendance" : "Save attendance"} resetOnSuccess={false}>
      <input type="hidden" name="batchId" value={batchId} />
      <input type="hidden" name="date" value={date} />
      {students.map((s) => <input key={s.id} type="hidden" name={`status:${s.id}`} value={state[s.id]} />)}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          <b className="text-emerald-700">{count("present")}</b> present · <b className="text-amber-600">{count("late")}</b> late · <b className="text-red-600">{count("absent")}</b> absent
        </p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setState(Object.fromEntries(students.map((s) => [s.id, "present" as Status])))}>
          ✓ Mark all present
        </button>
      </div>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {students.map((s, i) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0"><p className="truncate text-sm font-medium">{i + 1}. {s.name}</p><p className="text-xs text-slate-500">{s.studentId}</p></div>
            <div className="flex gap-1" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
              {(["present", "late", "absent"] as Status[]).map((st) => (
                <button key={st} type="button" role="radio" aria-checked={state[s.id] === st}
                  onClick={() => setState((p) => ({ ...p, [s.id]: st }))}
                  className={cn("rounded-lg border px-3 py-1 text-xs font-medium capitalize", state[s.id] === st ? STYLES[st] : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")}>
                  {st}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </ActionForm>
  );
}
