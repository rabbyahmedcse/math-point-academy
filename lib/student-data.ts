import "server-only";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { Batch } from "@/models/Batch";
import { Notice } from "@/models/Notice";
import { Fee } from "@/models/Fee";
import { monthStr } from "./utils";

export async function studentBatch(batchId?: string | null) {
  await connectDB();
  return batchId ? Batch.findById(batchId).lean() : null;
}

/** Notices visible to a student: all-student notices + their batch's, published and not expired. */
export async function studentNotices(batchId?: string | null, limit = 30) {
  await connectDB();
  const now = new Date();
  return Notice.find({
    publishDate: { $lte: now },
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] },
      { $or: [{ audience: "all" }, ...(batchId ? [{ audience: "batches", batchIds: new Types.ObjectId(batchId) }] : [])] },
    ],
  }).sort({ publishDate: -1 }).limit(limit).lean();
}

export interface FeeMonthRow {
  key: string;
  feeId?: string;
  month: string;
  amountDue: number;
  paidTotal: number;
  status: "paid" | "partial" | "due";
  payments: { receiptNo: string; amount: number; date: string; method: string }[];
}

/**
 * Month-by-month fees of one student (voided payments hidden). If the current month has no fee record yet,
 * a virtual "due" row is added so a family sees what is owed even before the first payment.
 */
export async function studentFeeMonths(s: { id: string; batchId?: string | null; monthlyFee?: number | null }): Promise<FeeMonthRow[]> {
  await connectDB();
  const fees = await Fee.find({ studentId: s.id }).lean();
  const rows: FeeMonthRow[] = fees.map((f) => ({
    key: String(f._id), feeId: String(f._id), month: f.month, amountDue: f.amountDue, paidTotal: f.paidTotal,
    status: f.status as FeeMonthRow["status"],
    payments: f.payments.filter((p) => !p.voided).map((p) => ({ receiptNo: p.receiptNo, amount: p.amount, date: p.date, method: String(p.method) })),
  }));
  const cur = monthStr();
  if (s.batchId && !rows.some((r) => r.month === cur)) {
    const b = await Batch.findById(s.batchId, { monthlyFee: 1 }).lean();
    const amountDue = s.monthlyFee ?? b?.monthlyFee ?? 0;
    if (amountDue > 0) rows.push({ key: `virtual-${cur}`, month: cur, amountDue, paidTotal: 0, status: "due", payments: [] });
  }
  return rows.sort((a, b) => b.month.localeCompare(a.month));
}
