import { notFound } from "next/navigation";
import { PrintButton } from "./PrintButton";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { formatDate, formatMonth, money } from "@/lib/utils";
import { Fee } from "@/models/Fee";
import { User } from "@/models/User";
import { Batch } from "@/models/Batch";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import { Types } from "mongoose";
import { ParentLink } from "@/models/ParentLink";

/** Printable receipt. Students/parents can only open their own; teachers only for batches they manage. */
export default async function ReceiptPage({ params }: { params: Promise<{ ref: string }> }) {
  const user = await requireRole(["admin", "teacher", "student", "parent"]);
  const { ref } = await params;
  const [feeId, receiptNo] = decodeURIComponent(ref).split("-RCT-").map((v, i) => (i ? `RCT-${v}` : v));
  if (!feeId || !Types.ObjectId.isValid(feeId) || !receiptNo) notFound();
  await connectDB();
  const fee = await Fee.findById(feeId).lean();
  const p = fee?.payments.find((x) => x.receiptNo === receiptNo && !x.voided);
  if (!fee || !p) notFound();
  if (user.role === "student" && String(fee.studentId) !== user.id) notFound();
  if (user.role === "parent" && !(await ParentLink.exists({ parentId: user.id, studentId: fee.studentId, status: "active" }))) notFound();
  const batch = await Batch.findById(fee.batchId).lean();
  if (user.role === "teacher" && !batch?.teacherIds.some((t) => String(t) === user.id)) notFound();
  const [student, s] = await Promise.all([User.findById(fee.studentId).lean(), Settings.findById("main").lean()]);

  return (
    <div className="mx-auto max-w-md">
      <div className="card space-y-3 text-sm">
        <div className="text-center">
          <h1 className="text-lg font-semibold">{s?.coachingName ?? SITE.name}</h1>
          {s?.address && <p className="text-xs text-slate-500">{s.address}</p>}
          <p className="mt-2 font-medium uppercase tracking-wide">Payment receipt</p>
        </div>
        <dl className="grid grid-cols-2 gap-y-1">
          <dt className="text-slate-500">Receipt no.</dt><dd>{p.receiptNo}</dd>
          <dt className="text-slate-500">Date</dt><dd>{formatDate(p.date)}</dd>
          <dt className="text-slate-500">Student</dt><dd>{student?.name} ({student?.studentId})</dd>
          <dt className="text-slate-500">Batch</dt><dd>{batch?.name}</dd>
          <dt className="text-slate-500">Fee month</dt><dd>{formatMonth(fee.month)}</dd>
          <dt className="text-slate-500">Method</dt><dd className="capitalize">{p.method}</dd>
          <dt className="text-slate-500">Received by</dt><dd>{p.enteredByName}</dd>
          <dt className="font-semibold">Amount paid</dt><dd className="font-semibold">{money(p.amount)}</dd>
          <dt className="text-slate-500">Month total / paid / due</dt><dd>{money(fee.amountDue)} / {money(fee.paidTotal)} / {money(Math.max(fee.amountDue - fee.paidTotal, 0))}</dd>
        </dl>
      </div>
      <div className="mt-4 text-center"><PrintButton /></div>
    </div>
  );
}
