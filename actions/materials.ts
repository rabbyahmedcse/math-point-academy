"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, oid } from "@/lib/access";
import { materialSchema, materialUpdateSchema } from "@/lib/validators";
import { zonedStartOfDay } from "@/lib/resources";
import { TZ } from "@/lib/utils";
import { Material } from "@/models/Misc";

/**
 * Authorization (unchanged policy): admins manage resources of every batch, teachers only of the batches
 * they teach (assertBatchAccess). Checked here on the server for every call — hiding buttons is not security.
 */

export async function createMaterial(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const d = materialSchema.parse(Object.fromEntries(fd));
    await assertBatchAccess(me, d.batchId);
    await Material.create({
      batchId: oid(d.batchId), title: d.title, description: d.description ?? "", kind: d.kind, url: d.url ?? "",
      ...(d.publishDate ? { publishAt: zonedStartOfDay(d.publishDate, TZ) } : {}),
      createdBy: oid(me.id), createdByName: me.name,
    });
    revalidatePath("/dashboard", "layout");
    return d.publishDate && zonedStartOfDay(d.publishDate, TZ) > new Date() ? "Scheduled. Students will see it on the chosen date." : "Published to the batch.";
  });
}

export async function updateMaterial(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const d = materialUpdateSchema.parse(Object.fromEntries(fd));
    const m = await Material.findById(oid(d.id), { batchId: 1 }).lean();
    if (!m) throw new AppError("Not found.");
    await assertBatchAccess(me, String(m.batchId)); // you must manage where it is now…
    await assertBatchAccess(me, d.batchId); // …and where you move it to
    const publishAt = d.publishDate ? zonedStartOfDay(d.publishDate, TZ) : null;
    await Material.updateOne(
      { _id: m._id },
      {
        $set: { batchId: oid(d.batchId), title: d.title, description: d.description ?? "", kind: d.kind, url: d.url ?? "", ...(publishAt ? { publishAt } : {}) },
        ...(publishAt ? {} : { $unset: { publishAt: 1 } }),
      },
    );
    revalidatePath("/dashboard", "layout");
    return "Changes saved.";
  });
}

export async function deleteMaterial(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const m = await Material.findById(oid(String(fd.get("id"))));
    if (!m) throw new AppError("Not found.");
    await assertBatchAccess(me, String(m.batchId));
    await m.deleteOne();
    revalidatePath("/dashboard", "layout");
    return "Deleted.";
  });
}
