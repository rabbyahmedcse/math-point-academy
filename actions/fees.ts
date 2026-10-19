"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, assertPermission, oid } from "@/lib/access";
import { feeSchema } from "@/lib/validators";
import { nextReceiptNo } from "@/lib/student-id";
import { audit } from "@/lib/audit";
import { joinMonth, todayStr } from "@/lib/utils";
import { Fee, feeStatus } from "@/models/Fee";
import { User } from "@/models/User";

/**
 * Record a payment (full or partial) for one student & month.
 * Stores amount, month, date, method and the entering user (Requirements §9).
 */
export async function recordPayment(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    assertPermission(me, "feeEntry");
    await connectDB();
    const d = feeSchema.parse(Object.fromEntries(fd));
    if (d.date > todayStr()) throw new AppError("Payment date cannot be in the future.");

    const student = await User.findOne({ _id: oid(d.studentId), role: "student", status: "active" }).lean();
    if (!student?.batchId) throw new AppError("Student not found or not assigned to a batch.");
    const batch = await assertBatchAccess(me, String(student.batchId));
    if (d.month < joinMonth(student.createdAt)) throw new AppError(`${student.name} registered in ${joinMonth(student.createdAt)}; fees start from that month.`);

    const amountDue = student.monthlyFee ?? batch.monthlyFee ?? 0;
    if (amountDue <= 0) throw new AppError("Set a monthly fee on the batch (or the student) first.");

    // Create the month's fee record on first use (atomic, race-safe thanks to the unique index).
    const fee = await Fee.findOneAndUpdate(
      { studentId: student._id, month: d.month },
      { $setOnInsert: { batchId: student.batchId, amountDue, paidTotal: 0, status: "due", payments: [] } },
      { upsert: true, new: true },
    );

    const receiptNo = await nextReceiptNo();
    // The paidTotal guard makes an over-payment impossible even with two concurrent entries.
    const updated = await Fee.findOneAndUpdate(
      { _id: fee._id, paidTotal: { $lte: fee.amountDue - d.amount } },
      {
        $push: { payments: { amount: d.amount, date: d.date, method: d.method, note: d.note ?? "", receiptNo, enteredBy: oid(me.id), enteredByName: me.name } },
        $inc: { paidTotal: d.amount },
      },
      { new: true },
    );
    if (!updated) throw new AppError(`Amount exceeds the remaining due (৳${fee.amountDue - fee.paidTotal}).`);
    updated.status = feeStatus(updated.paidTotal, updated.amountDue);
    await updated.save();

    await audit(me, "fee.payment", "Fee", String(fee._id), `${receiptNo} ৳${d.amount} ${d.month}`);
    revalidatePath("/dashboard", "layout");
    return `Payment recorded. Receipt ${receiptNo}.`;
  });
}

/** Admin only: void a wrong payment (never deleted; reason + who + when are kept). */
export async function voidPayment(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    await connectDB();
    const feeId = String(fd.get("feeId"));
    const receiptNo = String(fd.get("receiptNo"));
    const reason = String(fd.get("reason") ?? "").trim();
    if (reason.length < 3) throw new AppError("A reason is required to void a payment.");

    const fee = await Fee.findById(oid(feeId));
    const p = fee?.payments.find((x) => x.receiptNo === receiptNo);
    if (!fee || !p || p.voided) throw new AppError("Payment not found or already voided.");
    p.voided = true;
    p.voidedBy = oid(me.id);
    p.voidedAt = new Date();
    p.voidReason = reason;
    fee.paidTotal = Math.max(fee.paidTotal - p.amount, 0);
    fee.status = feeStatus(fee.paidTotal, fee.amountDue);
    await fee.save();
    await audit(me, "fee.void", "Fee", feeId, `${receiptNo}: ${reason}`);
    revalidatePath("/dashboard", "layout");
    return "Payment voided.";
  });
}

/** Admin only: change what a student owes for a month (e.g. discount). Audited. */
export async function adjustAmountDue(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    await connectDB();
    const studentId = String(fd.get("studentId"));
    const month = String(fd.get("month"));
    const amount = Number(fd.get("amountDue"));
    if (!Number.isFinite(amount) || amount < 0) throw new AppError("Enter a valid amount.");
    const student = await User.findById(oid(studentId)).lean();
    if (!student?.batchId) throw new AppError("Student has no batch.");
    if (month < joinMonth(student.createdAt)) throw new AppError(`Student registered in ${joinMonth(student.createdAt)}; fees start from that month.`);
    const fee = await Fee.findOneAndUpdate(
      { studentId: student._id, month },
      { $setOnInsert: { batchId: student.batchId, paidTotal: 0, payments: [] }, $set: { amountDue: amount } },
      { upsert: true, new: true },
    );
    fee.status = feeStatus(fee.paidTotal, fee.amountDue);
    await fee.save();
    await audit(me, "fee.adjust", "Fee", String(fee._id), `${month} -> ৳${amount}`);
    revalidatePath("/dashboard", "layout");
    return "Amount due updated.";
  });
}

