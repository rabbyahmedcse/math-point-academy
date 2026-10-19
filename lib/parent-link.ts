import "server-only";
import { oid } from "./access";
import { normalizePhone } from "./utils";
import { User } from "@/models/User";
import { ParentLink } from "@/models/ParentLink";

/** Every format a Bangladeshi mobile can have been saved in: 017…, 88017…, +88017… */
export function phoneVariants(phone?: string | null) {
  const n = normalizePhone(phone);
  return n ? [n, `88${n}`, `+88${n}`] : [];
}

/**
 * Siblings: link EVERY approved student whose guardian mobile equals this parent's (verified) mobile.
 * Links that already exist — including ones staff rejected — are left untouched.
 * Returns how many new links were created.
 */
export async function linkAllChildrenByPhone(parentId: string, parentPhone: string, relationship: string): Promise<number> {
  const variants = phoneVariants(parentPhone);
  if (!variants.length) return 0;
  const kids = await User.find({ role: "student", status: "active", guardianPhone: { $in: variants } }, { _id: 1 }).lean();
  let added = 0;
  for (const k of kids) {
    const r = await ParentLink.updateOne(
      { parentId: oid(parentId), studentId: k._id },
      { $setOnInsert: { relationship, status: "active", verifiedBy: "phone" } },
      { upsert: true },
    );
    if (r.upsertedCount) added++;
  }
  return added;
}

/**
 * Called when a student is approved: parents who already registered with this student's guardian mobile
 * get the new child added automatically (a younger sibling approved later shows up without any action).
 */
export async function linkParentsForStudent(studentId: string, guardianPhone?: string | null): Promise<number> {
  const variants = phoneVariants(guardianPhone);
  if (!variants.length) return 0;
  const parents = await User.find({ role: "parent", status: "active", phone: { $in: variants } }, { _id: 1 }).lean();
  let added = 0;
  for (const p of parents) {
    const known = await ParentLink.findOne({ parentId: p._id }, { relationship: 1 }).lean();
    const r = await ParentLink.updateOne(
      { parentId: p._id, studentId: oid(studentId) },
      { $setOnInsert: { relationship: known?.relationship ?? "guardian", status: "active", verifiedBy: "phone" } },
      { upsert: true },
    );
    if (r.upsertedCount) added++;
  }
  return added;
}
