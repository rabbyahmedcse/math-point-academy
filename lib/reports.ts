import "server-only";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import { getCurrentUser } from "./session";
import { batchScope, isStaff } from "./access";
import { monthStr } from "./utils";
import { summarizeFees, tallyAttendance, toAttendanceRows } from "./report-calc";
import { Attendance } from "@/models/Attendance";
import { Batch } from "@/models/Batch";
import { Fee } from "@/models/Fee";
import { User } from "@/models/User";
import type { SessionUser } from "./types";

/**
 * Staff-only reports. Replaces the optional FastAPI service (python-api/) — same data, same
 * MongoDB, same rules, but served by Next.js Route Handlers (app/api/reports/*) so no second
 * server or cookie-forwarding hop is needed.
 */

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * Shared guard for report route handlers. The role is ALWAYS taken from MongoDB (getCurrentUser
 * re-reads the user and requires status=active) — never from the request. Errors use FastAPI's
 * `{ "detail": "..." }` shape so the response format matches the old service.
 */
export async function runReport<T>(fn: (user: SessionUser) => Promise<T>): Promise<Response> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Not signed in or account not active");
    if (!isStaff(user)) throw new HttpError(403, "Staff only");
    return NextResponse.json(await fn(user), { headers: NO_STORE });
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ detail: e.message }, { status: e.status, headers: NO_STORE });
    console.error("[report error]", e);
    return NextResponse.json({ detail: "Something went wrong." }, { status: 500, headers: NO_STORE });
  }
}

/** Per-student attendance % for one batch and month (YYYY-MM). Teachers: own batches only. */
export async function getAttendanceReport(user: SessionUser, batchId: string, month: string) {
  await connectDB();
  const batch = await Batch.findById(batchId, { teacherIds: 1 }).lean();
  if (!batch) throw new HttpError(404, "Batch not found");
  if (user.role === "teacher" && !(batch.teacherIds ?? []).some((id) => String(id) === user.id)) {
    throw new HttpError(403, "Not your batch");
  }
  // `date` is a YYYY-MM-DD string, so a string range selects the month (and can use the {batchId,date} index).
  const docs = await Attendance.find(
    { batchId: batch._id, date: { $gte: `${month}-01`, $lte: `${month}-31` } },
    { records: 1 },
  ).sort({ date: 1 }).lean();
  const totals = tallyAttendance(docs);
  const users = totals.length
    ? await User.find({ _id: { $in: totals.map((t) => t.studentId) } }, { name: 1 }).lean()
    : [];
  return toAttendanceRows(totals, new Map(users.map((u) => [String(u._id), u.name])));
}

/** Expected / collected / due for a month. Admin: all batches, teacher: own batches (active or not). */
export async function getFeeReport(user: SessionUser, month: string = monthStr()) {
  await connectDB();
  const filter: Record<string, unknown> = { month };
  if (user.role === "teacher") {
    const mine = await Batch.find(batchScope(user), { _id: 1 }).lean();
    filter.batchId = { $in: mine.map((b) => b._id) };
  }
  const fees = await Fee.find(filter, { amountDue: 1, paidTotal: 1 }).lean();
  return { month, ...summarizeFees(fees) };
}
