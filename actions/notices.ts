"use server";

import { revalidatePath } from "next/cache";
import type { Types } from "mongoose";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, assertPermission, oid } from "@/lib/access";
import { noticeSchema } from "@/lib/validators";
import { Notice } from "@/models/Notice";
import type { SessionUser } from "@/lib/types";

/** Internal helper (not a form action): auto-notice for cancellations, exams, results. */
export async function notifyBatch(me: SessionUser, batchId: Types.ObjectId, title: string, body: string) {
  await Notice.create({ title, body, audience: "batches", batchIds: [batchId], createdBy: oid(me.id), createdByName: me.name, createdByRole: me.role });
}

export async function createNotice(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const d = noticeSchema.parse(Object.fromEntries(fd));
    const batchIds = fd.getAll("batchIds").map(String).filter(Boolean);

    if (d.audience === "teachers" && me.role !== "admin") throw new AppError("Only the admin can notify teachers.");
    if (d.audience === "all" && me.role === "teacher") assertPermission(me, "noticeAll");
    if (d.audience === "batches") {
      if (!batchIds.length) throw new AppError("Select at least one batch.");
      for (const id of batchIds) await assertBatchAccess(me, id);
    }
    await Notice.create({
      title: d.title, body: d.body, audience: d.audience,
      batchIds: d.audience === "batches" ? batchIds.map(oid) : [],
      publishDate: d.publishDate ? new Date(`${d.publishDate}T00:00:00+06:00`) : new Date(),
      expiresAt: d.expiresAt ? new Date(`${d.expiresAt}T23:59:59+06:00`) : undefined,
      attachmentUrl: d.attachmentUrl || undefined,
      createdBy: oid(me.id), createdByName: me.name, createdByRole: me.role,
    });
    revalidatePath("/dashboard", "layout");
    return "Notice published.";
  });
}

export async function deleteNotice(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const n = await Notice.findById(oid(String(fd.get("id"))));
    if (!n) throw new AppError("Notice not found.");
    if (me.role !== "admin" && String(n.createdBy) !== me.id) throw new AppError("You can only delete your own notices.");
    await n.deleteOne();
    revalidatePath("/dashboard", "layout");
    return "Notice deleted.";
  });
}
