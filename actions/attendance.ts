"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, oid } from "@/lib/access";
import { todayStr } from "@/lib/utils";
import { Attendance, ATTENDANCE_STATUS, type AttendanceStatus } from "@/models/Attendance";
import { User } from "@/models/User";

/**
 * Save (create or correct) attendance for one batch + date.
 * Form fields: batchId, date, and `status:<studentId>` = present|absent|late for every student.
 * Corrections keep a history entry with before/after for each changed student.
 */
export async function saveAttendance(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const batchId = String(fd.get("batchId") ?? "");
    const date = String(fd.get("date") ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError("Invalid date.");
    if (date > todayStr()) throw new AppError("You cannot mark attendance for a future date.");
    await assertBatchAccess(me, batchId);

    const students = await User.find({ role: "student", status: "active", batchId: oid(batchId) }, { _id: 1 }).lean();
    const valid = new Set(students.map((s) => String(s._id)));
    const records: { studentId: string; status: AttendanceStatus }[] = [];
    for (const [key, value] of fd.entries()) {
      if (!key.startsWith("status:")) continue;
      const sid = key.slice(7);
      const status = String(value) as AttendanceStatus;
      if (!valid.has(sid)) throw new AppError("A student in the form does not belong to this batch.");
      if (!ATTENDANCE_STATUS.includes(status)) throw new AppError("Invalid attendance status.");
      records.push({ studentId: sid, status });
    }
    if (!records.length) throw new AppError("There are no students to mark in this batch.");

    const existing = await Attendance.findOne({ batchId: oid(batchId), date });
    if (!existing) {
      await Attendance.create({ batchId: oid(batchId), date, takenBy: oid(me.id), records: records.map((r) => ({ ...r, studentId: oid(r.studentId) })) });
    } else {
      const before = new Map(existing.records.map((r) => [String(r.studentId), r.status]));
      const changes = records
        .filter((r) => before.get(r.studentId) !== r.status)
        .map((r) => ({ studentId: oid(r.studentId), from: before.get(r.studentId) ?? "none", to: r.status }));
      if (!changes.length) return "No changes to save.";
      existing.records.splice(0, existing.records.length, ...records.map((r) => ({ studentId: oid(r.studentId), status: r.status })));
      existing.history.push({ at: new Date(), by: oid(me.id), byName: me.name, changes });
      await existing.save();
    }
    revalidatePath("/dashboard", "layout");
    return "Attendance saved.";
  });
}
