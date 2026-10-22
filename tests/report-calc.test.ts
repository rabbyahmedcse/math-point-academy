import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeFees, tallyAttendance, toAttendanceRows } from "../lib/report-calc";

const rec = (studentId: string, status: string) => ({ studentId, status });

test("tallyAttendance: late counts as attended, absent does not", () => {
  const totals = tallyAttendance([
    { records: [rec("a", "present"), rec("b", "absent"), rec("c", "late")] },
    { records: [rec("a", "absent"), rec("b", "absent"), rec("c", "present")] },
    { records: [rec("a", "present")] },
  ]);
  assert.deepEqual(totals, [
    { studentId: "a", attended: 2, sessions: 3 },
    { studentId: "b", attended: 0, sessions: 2 },
    { studentId: "c", attended: 2, sessions: 2 },
  ]);
});

test("tallyAttendance: empty input", () => assert.deepEqual(tallyAttendance([]), []));

test("toAttendanceRows: percent rounding, missing name -> null", () => {
  const rows = toAttendanceRows(
    [
      { studentId: "a", attended: 2, sessions: 3 }, // 66.67 -> 67
      { studentId: "b", attended: 0, sessions: 2 }, // 0
      { studentId: "ghost", attended: 1, sessions: 1 }, // 100, user deleted
    ],
    new Map([["a", "Alice"], ["b", "Bob"]]),
  );
  assert.deepEqual(rows, [
    { studentId: "a", name: "Alice", attended: 2, sessions: 3, percent: 67 },
    { studentId: "b", name: "Bob", attended: 0, sessions: 2, percent: 0 },
    { studentId: "ghost", name: null, attended: 1, sessions: 1, percent: 100 },
  ]);
});

test("toAttendanceRows: exact .5 rounds up (same as the app's pct() helper)", () => {
  const [r] = toAttendanceRows([{ studentId: "a", attended: 1, sessions: 8 }], new Map());
  assert.equal(r.percent, 13); // 12.5% -> 13 (Python's round() gave 12; the UI everywhere else uses Math.round)
});

test("summarizeFees: partial / overpaid / unpaid / missing paidTotal", () => {
  assert.deepEqual(
    summarizeFees([
      { amountDue: 1000, paidTotal: 400 }, // due 600
      { amountDue: 1000, paidTotal: 1000 }, // due 0
      { amountDue: 500, paidTotal: 700 }, // overpaid -> due 0 (never negative)
      { amountDue: 800 }, // no paidTotal -> treated as 0, due 800
    ]),
    { records: 4, expected: 3300, collected: 2100, due: 1400 },
  );
});

test("summarizeFees: no records", () => {
  assert.deepEqual(summarizeFees([]), { records: 0, expected: 0, collected: 0, due: 0 });
});
