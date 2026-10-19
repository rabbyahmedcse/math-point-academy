"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, assertPermission, oid } from "@/lib/access";
import { parentRegisterSchema } from "@/lib/validators";
import { createCredentialUser } from "@/lib/users";
import { audit } from "@/lib/audit";
import { linkAllChildrenByPhone } from "@/lib/parent-link";
import { normalizePhone } from "@/lib/utils";
import { User } from "@/models/User";
import { ParentLink } from "@/models/ParentLink";

/**
 * Student verification for a parent link request.
 *  1. the Student ID must exist and the student must be approved (active)
 *  2. the parent's mobile is compared with the guardian mobile saved at student registration:
 *       match    -> link is active immediately
 *       no match -> link stays "pending" until a teacher/admin approves it
 * Student IDs are sequential (guessable), so a matching phone — or staff approval — is what actually
 * protects the child's data. A per-student daily limit slows down phone-number guessing.
 */
async function findStudentForLink(studentId: string, parentPhone: string) {
  const student = await User.findOne({ role: "student", studentId }).lean();
  if (!student) throw new AppError("No student found with this Student ID. Please check the ID and try again.");
  if (student.status !== "active") throw new AppError("This student's registration has not been approved yet. Please try again after approval.");
  const recent = await ParentLink.countDocuments({ studentId: student._id, createdAt: { $gte: new Date(Date.now() - 24 * 3600 * 1000) } });
  if (recent >= 5) throw new AppError("Too many link requests for this student today. Please contact the coaching center.");
  const matches = !!student.guardianPhone && normalizePhone(student.guardianPhone) === normalizePhone(parentPhone);
  return { student, matches };
}

const doneMessage = (matches: boolean, linked = 1) =>
  matches
    ? linked > 1
      ? `Verified! ${linked} children registered with your mobile number have been added to your dashboard.`
      : "Your child is verified and linked."
    : "Request sent. Your mobile number does not match the guardian number given at student registration, so a teacher or admin must verify the link before you can see your child's information.";

/** PUBLIC: create a parent account and link the first child. No session is opened. */
export async function registerParent(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const d = parentRegisterSchema.parse(Object.fromEntries(fd));
    await connectDB();
    const { student, matches } = await findStudentForLink(d.studentId, d.phone);

    const user = await createCredentialUser({
      name: d.name, email: d.email, password: d.password, role: "parent", status: "active", extra: { phone: d.phone },
    });
    try {
      await ParentLink.create({
        parentId: oid(user.id), studentId: student._id, relationship: d.relationship,
        status: matches ? "active" : "pending", verifiedBy: matches ? "phone" : undefined,
      });
    } catch (e) {
      const ctx = await auth.$context;
      await ctx.internalAdapter.deleteUser(user.id); // roll back the half-created account
      throw e;
    }
    // Student ID + mobile matched -> also add every other child registered with this guardian mobile.
    const siblings = matches ? await linkAllChildrenByPhone(user.id, d.phone, d.relationship).catch(() => 0) : 0;
    return `Parent account created. ${doneMessage(matches, 1 + siblings)}${matches ? " You can sign in now." : " You can sign in meanwhile, but no child data will show until it is verified."}`;
  });
}

async function loadLinkForReview(fd: FormData) {
  const me = await requireActionUser(["admin", "teacher"]);
  assertPermission(me, "approveStudents");
  await connectDB();
  const link = await ParentLink.findById(oid(String(fd.get("linkId"))));
  if (!link || link.status !== "pending") throw new AppError("This request is no longer pending.");
  const student = await User.findById(link.studentId).lean();
  if (!student?.batchId) throw new AppError("Student not found.");
  await assertBatchAccess(me, String(student.batchId)); // teachers: only their own batches
  return { me, link };
}

export async function approveParentLink(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { me, link } = await loadLinkForReview(fd);
    link.status = "active"; link.verifiedBy = "staff"; link.reviewedBy = oid(me.id); link.reviewedAt = new Date();
    await link.save();
    await audit(me, "parent.approve", "ParentLink", String(link._id));
    revalidatePath("/dashboard", "layout");
    return "Parent linked to the student.";
  });
}

export async function rejectParentLink(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { me, link } = await loadLinkForReview(fd);
    link.status = "rejected"; link.reviewedBy = oid(me.id); link.reviewedAt = new Date();
    link.rejectionReason = String(fd.get("reason") ?? "").trim();
    await link.save();
    await audit(me, "parent.reject", "ParentLink", String(link._id), link.rejectionReason ?? "");
    revalidatePath("/dashboard", "layout");
    return "Request rejected.";
  });
}
