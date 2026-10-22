import "server-only";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { Batch } from "@/models/Batch";
import { Fee, feeStatus, type FeeStatus } from "@/models/Fee";
import { Attendance } from "@/models/Attendance";
import { Routine } from "@/models/Routine";
import { User } from "@/models/User";
import { expandSessions, monthStr, todayStr } from "./utils";

export interface LedgerRow {
  studentId: string;
  name: string;
  studentCode?: string;
  batchId: string;
  batchName: string;
  amountDue: number;
  paid: number;
  due: number;
  status: FeeStatus;
  feeId?: string;
}

/**
 * Fee ledger for a month. Students with no Fee document yet are shown as DUE at their expected
 * fee (student override, else batch fee), so "due" is correct even before the first payment.
 */
export async function getFeeLedger(month: string, batchIds?: Types.ObjectId[]): Promise<LedgerRow[]> {
  return (await getFeeLedgerWithFees(month, batchIds)).rows;
}

/** Same as getFeeLedger, but also returns the month's Fee documents it already loaded (payments included), so callers need no second query. */
export async function getFeeLedgerWithFees(month: string, batchIds?: Types.ObjectId[]) {
  await connectDB();
  const batchFilter = batchIds ? { _id: { $in: batchIds } } : {};
  const batches = await Batch.find({ status: "active", ...batchFilter }).lean();
  const batchMap = new Map(batches.map((b) => [String(b._id), b]));
  // A student is listed only from the month they registered — earlier months never show them.
  const students = (await User.find({
    role: "student", status: "active", batchId: { $in: batches.map((b) => b._id) },
  }).sort({ name: 1 }).lean()).filter((s) => !s.createdAt || monthStr(s.createdAt) <= month);
  const fees = await Fee.find({ month, studentId: { $in: students.map((s) => s._id) } }).lean();
  const feeMap = new Map(fees.map((f) => [String(f.studentId), f]));

  const rows: LedgerRow[] = students.map((s) => {
    const b = batchMap.get(String(s.batchId))!;
    const f = feeMap.get(String(s._id));
    const amountDue = f ? f.amountDue : (s.monthlyFee ?? b.monthlyFee ?? 0);
    const paid = f?.paidTotal ?? 0;
    return {
      studentId: String(s._id), name: s.name, studentCode: s.studentId ?? undefined,
      batchId: String(b._id), batchName: b.name, amountDue, paid,
      due: Math.max(amountDue - paid, 0), status: feeStatus(paid, amountDue), feeId: f ? String(f._id) : undefined,
    };
  });
  return { rows, fees };
}

export async function todaysClasses(batchIds?: Types.ObjectId[]) {
  const today = todayStr();
  const routines = await Routine.find({ ...(batchIds ? { batchId: { $in: batchIds } } : {}) }).lean();
  const batches = await Batch.find({ _id: { $in: [...new Set(routines.map((r) => String(r.batchId)))] } }).lean();
  const names = new Map(batches.map((b) => [String(b._id), b.name]));
  return expandSessions(routines, today, 1).map(({ routine }) => ({ ...routine, batchName: names.get(String(routine.batchId)) ?? "—" }));
}

export async function attendanceToday(batchIds?: Types.ObjectId[]) {
  const docs = await Attendance.find({ date: todayStr(), ...(batchIds ? { batchId: { $in: batchIds } } : {}) }).lean();
  const t = { present: 0, absent: 0, late: 0 };
  for (const d of docs) for (const r of d.records) t[r.status]++;
  return t;
}

export async function getAdminOverview() {
  await connectDB();
  const [students, pending, teachers, batches, classes, att, ledger] = await Promise.all([
    User.countDocuments({ role: "student", status: "active" }),
    User.countDocuments({ role: "student", status: "pending" }),
    User.countDocuments({ role: "teacher", status: "active" }),
    Batch.countDocuments({ status: "active" }),
    todaysClasses(),
    attendanceToday(),
    getFeeLedger(monthStr()),
  ]);
  return {
    students, pending, teachers, batches, classes, att,
    collected: ledger.reduce((s, r) => s + r.paid, 0),
    due: ledger.reduce((s, r) => s + r.due, 0),
    unpaidStudents: ledger.filter((r) => r.status !== "paid").length,
  };
}

/** Attendance % for a student (late counts as attended). */
export async function studentAttendance(studentId: string, batchId?: string | null) {
  const docs = await Attendance.find(
    { "records.studentId": new Types.ObjectId(studentId), ...(batchId ? { batchId: new Types.ObjectId(batchId) } : {}) },
    { date: 1, records: { $elemMatch: { studentId: new Types.ObjectId(studentId) } } },
  ).sort({ date: -1 }).lean();
  const rows = docs.map((d) => ({ date: d.date, status: d.records[0].status }));
  const attended = rows.filter((r) => r.status !== "absent").length;
  return { rows, attended, total: rows.length, percent: rows.length ? Math.round((attended / rows.length) * 100) : 0 };
}

/**
 * Total outstanding across ALL months for the given batches (shown in the red banner on the Fees page).
 * = unpaid balance of every saved Fee record of active students
 *   + this month's expected fee for students that have no Fee record yet.
 * Past months in which nothing was ever recorded are unknown to the system and are not counted.
 *
 * The saved-balance aggregate and the current-month ledger are independent, so they run in parallel.
 * Pass `currentLedger` (a ledger / promise already computed for the CURRENT month and the SAME batches)
 * to avoid computing it a second time.
 */
export async function getTotalDueAllMonths(
  batchIds?: Types.ObjectId[],
  currentLedger?: LedgerRow[] | Promise<LedgerRow[]>,
): Promise<number> {
  await connectDB();
  const [saved, current] = await Promise.all([
    (async () => {
      const students = await User.find(
        { role: "student", status: "active", batchId: batchIds ? { $in: batchIds } : { $ne: null } },
        { _id: 1 },
      ).lean();
      const [agg] = await Fee.aggregate([
        { $match: { studentId: { $in: students.map((s) => s._id) } } },
        { $group: { _id: null, due: { $sum: { $max: [{ $subtract: ["$amountDue", "$paidTotal"] }, 0] } } } },
      ]);
      return (agg?.due ?? 0) as number;
    })(),
    currentLedger ?? getFeeLedger(monthStr(), batchIds),
  ]);
  const unrecorded = current.filter((r) => !r.feeId).reduce((s, r) => s + r.due, 0);
  return saved + unrecorded;
}
