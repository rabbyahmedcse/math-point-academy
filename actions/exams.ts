"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, oid } from "@/lib/access";
import { examSchema } from "@/lib/validators";
import { PERFORMANCE_VALUES, performanceLabel } from "@/lib/performance";
import { audit } from "@/lib/audit";
import { Exam } from "@/models/Exam";
import { User } from "@/models/User";
import { notifyBatch } from "./notices";

const refresh = () => revalidatePath("/dashboard", "layout");

async function loadExam(me: Awaited<ReturnType<typeof requireActionUser>>, id: string) {
  const exam = await Exam.findById(oid(id));
  if (!exam) throw new AppError("Exam not found.");
  await assertBatchAccess(me, String(exam.batchId));
  return exam;
}

export async function createExam(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const d = examSchema.parse(Object.fromEntries(fd));
    const batch = await assertBatchAccess(me, d.batchId);
    const exam = await Exam.create({ ...d, batchId: batch._id, createdBy: oid(me.id), audit: [{ by: oid(me.id), byName: me.name, action: "create" }] });
    await notifyBatch(me, batch._id, `Exam scheduled: ${d.name}`, `${d.subject} exam on ${d.date}${d.startTime ? ` at ${d.startTime}` : ""}. Full marks: ${d.fullMarks}.`);
    await audit(me, "exam.create", "Exam", String(exam._id), d.name);
    refresh();
    return "Exam created and students notified.";
  });
}

export async function cancelExam(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const exam = await loadExam(me, String(fd.get("examId")));
    exam.status = "cancelled";
    exam.audit.push({ at: new Date(), by: oid(me.id), byName: me.name, action: "cancel", detail: "" });
    await exam.save();
    await notifyBatch(me, exam.batchId, `Exam cancelled: ${exam.name}`, `The ${exam.subject} exam scheduled on ${exam.date} has been cancelled.`);
    refresh();
    return "Exam cancelled.";
  });
}

/**
 * Enter / correct marks AND performance. Fields: examId, `marks:<studentId>`, `performance:<studentId>`.
 * Admin and the batch's teacher have the SAME power: marks can be changed at any time, even after the
 * result is published. Every change is written to exam.audit (and the global activity log).
 */
export async function saveMarks(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const exam = await loadExam(me, String(fd.get("examId")));
    if (exam.status === "cancelled") throw new AppError("This exam is cancelled.");

    const students = await User.find({ role: "student", status: "active", batchId: exam.batchId }, { _id: 1, name: 1 }).lean();
    const old = new Map(exam.results.map((r) => [String(r.studentId), r]));
    const next: { studentId: ReturnType<typeof oid>; marks: number | null; performance: string }[] = [];
    const changes: string[] = [];

    for (const s of students) {
      const sid = String(s._id);
      const raw = String(fd.get(`marks:${sid}`) ?? "").trim();
      const performance = String(fd.get(`performance:${sid}`) ?? "").trim();
      if (performance && !PERFORMANCE_VALUES.includes(performance)) throw new AppError("Invalid performance value.");
      let marks: number | null = null;
      if (raw !== "") {
        marks = Number(raw);
        if (!Number.isFinite(marks) || marks < 0 || marks > exam.fullMarks) throw new AppError(`Marks must be between 0 and ${exam.fullMarks}.`);
      }
      const prev = old.get(sid);
      if (prev) {
        if ((prev.marks ?? null) !== marks) changes.push(`${s.name}: marks ${prev.marks ?? "—"} → ${marks ?? "—"}`);
        if ((prev.performance ?? "") !== performance) changes.push(`${s.name}: performance ${performanceLabel(prev.performance)} → ${performanceLabel(performance)}`);
      }
      next.push({ studentId: oid(sid), marks, performance });
    }

    const wasPublished = exam.publishStatus === "published";
    exam.results.splice(0, exam.results.length, ...next);
    exam.audit.push({
      at: new Date(), by: oid(me.id), byName: me.name, action: "marks",
      detail: (changes.length ? `Updated${wasPublished ? " after publish" : ""}: ${changes.join("; ")}` : "Entered"),
    });
    await exam.save();
    if (changes.length) await audit(me, "exam.marksChanged", "Exam", String(exam._id), changes.join("; "));
    refresh();
    return wasPublished && changes.length ? "Marks updated. Students see the new values immediately." : "Marks saved.";
  });
}

/** Admin and the batch's teacher can publish directly — no approval step. */
export async function publishResult(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const exam = await loadExam(me, String(fd.get("examId")));
    if (!exam.results.some((r) => r.marks !== null)) throw new AppError("Enter marks before publishing.");
    exam.publishStatus = "published";
    exam.publishedAt = new Date();
    exam.publishedBy = oid(me.id);
    exam.audit.push({ at: new Date(), by: oid(me.id), byName: me.name, action: "publish", detail: "" });
    await exam.save();
    await notifyBatch(me, exam.batchId, `Result published: ${exam.name}`, `Results for ${exam.subject} are now available in your dashboard.`);
    refresh();
    return "Result published.";
  });
}

export async function unpublishResult(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const exam = await loadExam(me, String(fd.get("examId")));
    exam.publishStatus = "draft";
    exam.audit.push({ at: new Date(), by: oid(me.id), byName: me.name, action: "unpublish", detail: "" });
    await exam.save();
    refresh();
    return "Result moved back to draft — students can no longer see it.";
  });
}
