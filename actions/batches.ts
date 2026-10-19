"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, assertPermission, oid } from "@/lib/access";
import { batchSchema } from "@/lib/validators";
import { audit } from "@/lib/audit";
import { Batch } from "@/models/Batch";
import { User } from "@/models/User";

const refresh = () => revalidatePath("/dashboard", "layout");

async function teacherIdsFrom(me: { id: string; role: string }, fd: FormData) {
  if (me.role === "teacher") return [oid(me.id)];
  const ids = fd.getAll("teacherIds").map(String).filter(Boolean);
  if (ids.length) {
    const n = await User.countDocuments({ _id: { $in: ids.map(oid) }, role: "teacher" });
    if (n !== ids.length) throw new AppError("One or more selected teachers are invalid.");
  }
  return ids.map(oid);
}

export async function createBatch(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    assertPermission(me, "manageBatches");
    await connectDB();
    const d = batchSchema.parse(Object.fromEntries(fd));
    const batch = await Batch.create({ ...d, teacherIds: await teacherIdsFrom(me, fd), createdBy: oid(me.id) });
    await audit(me, "batch.create", "Batch", String(batch._id), d.name);
    refresh();
    return "Batch created.";
  });
}

export async function updateBatch(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    assertPermission(me, "manageBatches");
    await connectDB();
    const id = String(fd.get("id"));
    await assertBatchAccess(me, id);
    const d = batchSchema.parse(Object.fromEntries(fd));
    const update: Record<string, unknown> = { ...d };
    if (me.role === "admin") update.teacherIds = await teacherIdsFrom(me, fd);
    await Batch.updateOne({ _id: oid(id) }, { $set: update });
    await audit(me, "batch.update", "Batch", id, d.name);
    refresh();
    return "Batch updated.";
  });
}

/** Batches are deactivated, not deleted, so attendance/fee history is preserved. */
export async function setBatchActive(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    assertPermission(me, "manageBatches");
    await connectDB();
    const id = String(fd.get("id"));
    await assertBatchAccess(me, id);
    const active = fd.get("active") === "true";
    await Batch.updateOne({ _id: oid(id) }, { $set: { status: active ? "active" : "inactive" } });
    await audit(me, active ? "batch.activate" : "batch.deactivate", "Batch", id);
    refresh();
    return active ? "Batch activated." : "Batch deactivated.";
  });
}
