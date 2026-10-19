import "server-only";
import { Types } from "mongoose";
import { AppError } from "./action";
import { Batch } from "@/models/Batch";
import type { PermissionKey } from "@/models/User";
import type { SessionUser } from "./types";

export function assertPermission(user: SessionUser, key: PermissionKey) {
  if (user.role === "admin") return;
  if (user.role !== "teacher" || !user.permissions[key]) {
    throw new AppError("The admin has not enabled this permission for your account.");
  }
}

export const isStaff = (u: SessionUser) => u.role === "admin" || u.role === "teacher";
export const oid = (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid reference.");
  return new Types.ObjectId(id);
};

/** Mongo filter for the batches this user may manage. Admin = all, teacher = own. */
export const batchScope = (u: SessionUser) => (u.role === "admin" ? {} : { teacherIds: oid(u.id) });

export async function batchesFor(u: SessionUser, activeOnly = true) {
  return Batch.find({ ...batchScope(u), ...(activeOnly ? { status: "active" } : {}) })
    .sort({ name: 1 })
    .lean();
}

/** Loads a batch and verifies this staff member may act on it. */
export async function assertBatchAccess(u: SessionUser, batchId: string) {
  const batch = await Batch.findOne({ _id: oid(batchId), ...batchScope(u) }).lean();
  if (!batch) throw new AppError("Batch not found or you do not manage it.");
  return batch;
}
