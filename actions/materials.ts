"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { assertBatchAccess, oid } from "@/lib/access";
import { materialSchema } from "@/lib/validators";
import { Material } from "@/models/Misc";

export async function createMaterial(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher"]);
    await connectDB();
    const d = materialSchema.parse(Object.fromEntries(fd));
    await assertBatchAccess(me, d.batchId);
    await Material.create({ ...d, batchId: oid(d.batchId), url: d.url ?? "", createdBy: oid(me.id), createdByName: me.name });
    revalidatePath("/dashboard", "layout");
    return "Published to the batch.";
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
