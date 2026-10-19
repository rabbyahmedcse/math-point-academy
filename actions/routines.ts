"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, oid } from "@/lib/access";
import { routineSchema } from "@/lib/validators";
import { timesOverlap, weekdayOf, formatDate } from "@/lib/utils";
import { Routine } from "@/models/Routine";
import { notifyBatch } from "./notices";

const refresh = () => revalidatePath("/dashboard", "layout");

/** Looks for another class of the same teacher overlapping this slot. */
async function findConflict(teacherId: string | undefined, r: { kind: string; dayOfWeek?: number; date?: string; startTime: string; endTime: string }, ignoreId?: string) {
  if (!teacherId) return null;
  const candidates = await Routine.find({
    teacherId: oid(teacherId), status: "scheduled", ...(ignoreId ? { _id: { $ne: oid(ignoreId) } } : {}),
  }).lean();
  return candidates.find((c) => {
    const sameDay =
      (r.kind === "weekly" && c.kind === "weekly" && c.dayOfWeek === r.dayOfWeek) ||
      (r.kind === "oneoff" && c.kind === "oneoff" && c.date === r.date) ||
      (r.kind === "weekly" && c.kind === "oneoff" && c.date && weekdayOf(c.date) === r.dayOfWeek) ||
      (r.kind === "oneoff" && c.kind === "weekly" && r.date && c.dayOfWeek === weekdayOf(r.date) && !(c.skipDates ?? []).includes(r.date));
    return sameDay && timesOverlap(r.startTime, r.endTime, c.startTime, c.endTime);
  });
}

export async function createRoutine(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const d = routineSchema.parse(Object.fromEntries(fd));
    const batch = await assertBatchAccess(me, d.batchId);
    const teacherId = d.teacherId || (me.role === "teacher" ? me.id : String(batch.teacherIds[0] ?? "")) || undefined;

    const clash = await findConflict(teacherId, d);
    if (clash && d.force !== "on") {
      throw new AppError(`Conflict warning: this teacher already has "${clash.subject}" ${clash.startTime}–${clash.endTime} at that time. Tick "Save anyway" to confirm.`);
    }
    await Routine.create({
      batchId: batch._id, kind: d.kind,
      dayOfWeek: d.kind === "weekly" ? d.dayOfWeek : undefined,
      date: d.kind === "oneoff" ? d.date : undefined,
      startTime: d.startTime, endTime: d.endTime, subject: d.subject, location: d.location ?? "",
      teacherId: teacherId ? oid(teacherId) : undefined, createdBy: oid(me.id),
    });
    if (d.kind === "oneoff") await notifyBatch(me, batch._id, `Extra class: ${d.subject}`, `${formatDate(d.date)} ${d.startTime}–${d.endTime}${d.location ? ` @ ${d.location}` : ""}`);
    refresh();
    return "Class added to the routine.";
  });
}

export async function deleteRoutine(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const r = await Routine.findById(oid(String(fd.get("id"))));
    if (!r) throw new AppError("Routine not found.");
    await assertBatchAccess(me, String(r.batchId));
    await r.deleteOne();
    refresh();
    return "Routine entry removed.";
  });
}

/** Cancel one occurrence (date) of a class. Students are notified automatically. */
export async function cancelClass(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const r = await Routine.findById(oid(String(fd.get("id"))));
    if (!r) throw new AppError("Routine not found.");
    await assertBatchAccess(me, String(r.batchId));
    const date = String(fd.get("date") ?? r.date ?? "");
    const reason = String(fd.get("reason") ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError("Pick the date to cancel.");

    if (r.kind === "weekly") {
      if (weekdayOf(date) !== r.dayOfWeek) throw new AppError("That date is not on this class's weekday.");
      r.skipDates.push(date);
      await r.save();
      await Routine.create({ batchId: r.batchId, kind: "oneoff", date, startTime: r.startTime, endTime: r.endTime, subject: r.subject, location: r.location, teacherId: r.teacherId, status: "cancelled", note: reason, createdBy: oid(me.id) });
    } else {
      r.status = "cancelled"; r.note = reason; await r.save();
    }
    await notifyBatch(me, r.batchId, `Class cancelled: ${r.subject}`, `${formatDate(date)} ${r.startTime}–${r.endTime}.${reason ? ` Reason: ${reason}` : ""}`);
    refresh();
    return "Class cancelled and students notified.";
  });
}

/** Move one occurrence to a new date/time (creates a one-off, skips the original date). */
export async function rescheduleClass(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const r = await Routine.findById(oid(String(fd.get("id"))));
    if (!r) throw new AppError("Routine not found.");
    await assertBatchAccess(me, String(r.batchId));
    const fromDate = String(fd.get("fromDate") ?? r.date ?? "");
    const newDate = String(fd.get("newDate") ?? "");
    const startTime = String(fd.get("startTime") ?? "");
    const endTime = String(fd.get("endTime") ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate) || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || endTime <= startTime) throw new AppError("Enter a valid new date and time.");

    const clash = await findConflict(r.teacherId ? String(r.teacherId) : undefined, { kind: "oneoff", date: newDate, startTime, endTime }, String(r._id));
    if (clash && fd.get("force") !== "on") throw new AppError(`Conflict warning: teacher already has "${clash.subject}" ${clash.startTime}–${clash.endTime}. Tick "Save anyway" to confirm.`);

    if (r.kind === "weekly") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || weekdayOf(fromDate) !== r.dayOfWeek) throw new AppError("Pick the original date of this class.");
      r.skipDates.push(fromDate);
      await r.save();
      await Routine.create({ batchId: r.batchId, kind: "oneoff", date: newDate, startTime, endTime, subject: r.subject, location: r.location, teacherId: r.teacherId, note: `Rescheduled from ${fromDate}`, createdBy: oid(me.id) });
    } else {
      r.date = newDate; r.startTime = startTime; r.endTime = endTime; r.note = "Rescheduled"; await r.save();
    }
    await notifyBatch(me, r.batchId, `Class rescheduled: ${r.subject}`, `New time: ${formatDate(newDate)} ${startTime}–${endTime}.`);
    refresh();
    return "Class rescheduled and students notified.";
  });
}
