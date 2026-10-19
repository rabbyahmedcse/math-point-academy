"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, assertPermission, oid } from "@/lib/access";
import { audit } from "@/lib/audit";
import { revokeSessions } from "@/lib/users";
import { User } from "@/models/User";
import { linkParentsForStudent } from "@/lib/parent-link";

const refresh = () => revalidatePath("/dashboard", "layout");

/** Approve a pending registration AND assign the batch in one step. */
export async function approveStudent(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    assertPermission(me, "approveStudents");
    await connectDB();
    const studentId = String(fd.get("studentId") ?? "");
    const batchId = String(fd.get("batchId") ?? "");
    if (!batchId) throw new AppError("Select a batch before approving.");
    await assertBatchAccess(me, batchId);

    const res = await User.updateOne(
      { _id: oid(studentId), role: "student", status: "pending" },
      { $set: { status: "active", batchId: oid(batchId), reviewedBy: oid(me.id), reviewedAt: new Date(), updatedAt: new Date(), rejectionReason: "" } },
    );
    if (!res.modifiedCount) throw new AppError("This registration is no longer pending.");
    await audit(me, "student.approve", "User", studentId, `batch=${batchId}`);
    // Parents already registered with this guardian mobile get the new child automatically (never blocks approval).
    const st = await User.findById(oid(studentId), { guardianPhone: 1 }).lean();
    await linkParentsForStudent(studentId, st?.guardianPhone).catch((e) => console.error("[parent auto-link]", e));
    refresh();
    return "Student approved and assigned to the batch.";
  });
}

export async function rejectStudent(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    assertPermission(me, "approveStudents");
    await connectDB();
    const studentId = String(fd.get("studentId") ?? "");
    const reason = String(fd.get("reason") ?? "").trim();
    const res = await User.updateOne(
      { _id: oid(studentId), role: "student", status: "pending" },
      { $set: { status: "rejected", rejectionReason: reason, reviewedBy: oid(me.id), reviewedAt: new Date(), updatedAt: new Date() } },
    );
    if (!res.modifiedCount) throw new AppError("This registration is no longer pending.");
    await audit(me, "student.reject", "User", studentId, reason);
    refresh();
    return "Registration rejected.";
  });
}

/** Move an active student to another batch (teacher: only batches they manage). */
export async function assignBatch(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    assertPermission(me, "approveStudents");
    await connectDB();
    const studentId = String(fd.get("studentId") ?? "");
    const batchId = String(fd.get("batchId") ?? "");
    await assertBatchAccess(me, batchId);
    const res = await User.updateOne({ _id: oid(studentId), role: "student", status: "active" }, { $set: { batchId: oid(batchId), updatedAt: new Date() } });
    if (!res.matchedCount) throw new AppError("Student not found.");
    await audit(me, "student.assignBatch", "User", studentId, `batch=${batchId}`);
    refresh();
    return "Batch updated.";
  });
}

/** Admin only: activate / deactivate any student or teacher. Deactivation revokes sessions at once. */
export async function setUserActive(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    await connectDB();
    const id = String(fd.get("id") ?? "");
    const active = fd.get("active") === "true";
    if (id === me.id) throw new AppError("You cannot deactivate your own account.");
    const target = await User.findOne({ _id: oid(id), role: { $in: ["teacher", "student"] } });
    if (!target) throw new AppError("User not found.");
    if (active && target.role === "student" && !target.batchId) throw new AppError("Assign a batch first (approve the registration).");
    target.status = active ? "active" : "inactive";
    target.updatedAt = new Date();
    await target.save();
    if (!active) await revokeSessions(id);
    await audit(me, active ? "user.activate" : "user.deactivate", "User", id);
    refresh();
    return active ? "Account activated." : "Account deactivated.";
  });
}

export async function updateStudentFee(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    await connectDB();
    const raw = String(fd.get("monthlyFee") ?? "").trim();
    const value = raw === "" ? undefined : Number(raw);
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) throw new AppError("Enter a valid fee.");
    const id = String(fd.get("id"));
    await User.updateOne({ _id: oid(id) }, value === undefined ? { $unset: { monthlyFee: 1 } } : { $set: { monthlyFee: value } });
    await audit(me, "student.fee", "User", id, String(value ?? "batch default"));
    refresh();
    return "Student fee updated.";
  });
}

