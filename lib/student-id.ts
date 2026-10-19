import "server-only";
import { connectDB } from "./db";
import { Counter } from "@/models/Misc";

/**
 * Collision-free IDs: STU-2026-0001, STU-2026-0002 …
 * `findOneAndUpdate + $inc + upsert` is atomic in MongoDB, so two students registering at the same
 * instant can never receive the same number.
 */
export async function nextSequence(key: string): Promise<number> {
  await connectDB();
  const c = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return c.seq;
}

export async function nextStudentId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`student-${year}`);
  return `STU-${year}-${String(seq).padStart(4, "0")}`;
}

export async function nextReceiptNo() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`receipt-${year}`);
  return `RCT-${year}-${String(seq).padStart(5, "0")}`;
}
