import "server-only";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { studentAttendance } from "./stats";
import { studentFeeMonths } from "./student-data";
import { Batch } from "@/models/Batch";
import { Exam } from "@/models/Exam";
import { ParentLink } from "@/models/ParentLink";
import { User } from "@/models/User";

/**
 * The ONLY gateway to a child's data for parent pages: returns children whose link is ACTIVE
 * and whose student account is active. Any child id from the URL is checked against this list,
 * so a parent can never open somebody else's child by editing ?child=.
 */
export async function getChildren(parentId: string) {
  await connectDB();
  const links = await ParentLink.find({ parentId, status: "active" }).lean();
  if (!links.length) return [];
  const students = await User.find({ _id: { $in: links.map((l) => l.studentId) }, role: "student", status: "active" }).sort({ name: 1 }).lean();
  const batches = await Batch.find({ _id: { $in: students.map((s) => s.batchId).filter(Boolean) } }, { name: 1 }).lean();
  const batchName = new Map(batches.map((b) => [String(b._id), b.name]));
  const rel = new Map(links.map((l) => [String(l.studentId), l.relationship]));
  return students.map((s) => ({
    id: String(s._id),
    name: s.name,
    studentId: s.studentId ?? "",
    className: s.className ?? "",
    batchId: s.batchId ? String(s.batchId) : null,
    batchName: s.batchId ? batchName.get(String(s.batchId)) ?? "—" : "—",
    image: s.image ?? null,
    relationship: rel.get(String(s._id)) ?? "guardian",
    monthlyFee: s.monthlyFee ?? null,
  }));
}
export type Child = Awaited<ReturnType<typeof getChildren>>[number];

export async function resolveChild(parentId: string, childParam?: string) {
  const children = await getChildren(parentId);
  const child = children.find((c) => c.id === childParam) ?? children[0] ?? null;
  return { children, child };
}

export async function pendingLinkCount(parentId: string) {
  await connectDB();
  return ParentLink.countDocuments({ parentId, status: "pending" });
}

/** Quick numbers for the "My Children" cards. */
export async function childSnapshot(c: Child) {
  const [att, months, exam] = await Promise.all([
    studentAttendance(c.id),
    studentFeeMonths({ id: c.id, batchId: c.batchId, monthlyFee: c.monthlyFee }),
    c.batchId
      ? Exam.findOne({ batchId: c.batchId, publishStatus: "published", status: "scheduled" }, { name: 1, subject: 1, fullMarks: 1, results: { $elemMatch: { studentId: new Types.ObjectId(c.id) } } }).sort({ date: -1 }).lean()
      : null,
  ]);
  const due = months.reduce((s, m) => s + Math.max(m.amountDue - m.paidTotal, 0), 0);
  const mark = exam?.results?.[0]?.marks ?? null;
  return { att, due, latest: exam && mark != null ? { name: exam.name, subject: exam.subject, marks: mark, full: exam.fullMarks } : null };
}
