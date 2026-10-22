/**
 * Pure report calculations (no database, no framework imports) — ported from the former
 * python-api/main.py so they can be unit-tested in isolation (see tests/report-calc.test.ts).
 */

export interface AttendanceDocLike {
  records: { studentId: { toString(): string }; status: string }[];
}
export interface AttendanceTotals {
  studentId: string;
  attended: number;
  sessions: number;
}
export interface AttendanceReportRow {
  studentId: string;
  name: string | null;
  attended: number;
  sessions: number;
  percent: number;
}

/**
 * Counts, per student, every recorded session and every session they attended
 * (anything other than "absent" counts as attended — "late" is attended).
 * Output order = order in which students first appear in `docs`.
 */
export function tallyAttendance(docs: AttendanceDocLike[]): AttendanceTotals[] {
  const totals = new Map<string, AttendanceTotals>();
  for (const doc of docs) {
    for (const rec of doc.records) {
      const id = rec.studentId.toString();
      let t = totals.get(id);
      if (!t) {
        t = { studentId: id, attended: 0, sessions: 0 };
        totals.set(id, t);
      }
      t.sessions += 1;
      if (rec.status !== "absent") t.attended += 1;
    }
  }
  return [...totals.values()];
}

/** Adds the student's name (null when the user no longer exists) and the attendance percentage. */
export function toAttendanceRows(totals: AttendanceTotals[], names: Map<string, string>): AttendanceReportRow[] {
  return totals.map((t) => ({
    studentId: t.studentId,
    name: names.get(t.studentId) ?? null,
    attended: t.attended,
    sessions: t.sessions,
    percent: t.sessions ? Math.round((t.attended / t.sessions) * 100) : 0,
  }));
}

export interface FeeLike {
  amountDue: number;
  paidTotal?: number | null;
}

/** Expected vs collected vs outstanding for a set of monthly Fee records. */
export function summarizeFees(fees: FeeLike[]) {
  let expected = 0;
  let collected = 0;
  let due = 0;
  for (const f of fees) {
    const paid = f.paidTotal ?? 0;
    expected += f.amountDue;
    collected += paid;
    due += Math.max(f.amountDue - paid, 0);
  }
  return { records: fees.length, expected, collected, due };
}
