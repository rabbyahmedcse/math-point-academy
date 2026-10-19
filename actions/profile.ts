"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { profileSchema } from "@/lib/validators";
import { User } from "@/models/User";

/**
 * Update the signed-in user's OWN profile. What each role may change:
 *   admin / teacher : name, mobile
 *   student         : mobile, address and a PHOTO LINK (URL only — the image itself is never uploaded or stored)
 *   parent          : name (the mobile number links children, so it is locked)
 * E-mail is the login identity and cannot be changed here.
 */
export async function updateProfile(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher", "student", "parent"]);
    const d = profileSchema.parse(Object.fromEntries(fd));
    await connectDB();

    const set: Record<string, unknown> = { updatedAt: new Date() };
    const unset: Record<string, 1> = {};

    if (me.role !== "student" && d.name) set.name = d.name;

    if (me.role !== "parent" && d.phone !== undefined) {
      if (d.phone) set.phone = d.phone;
      else if (me.role === "student") throw new AppError("Mobile number is required.");
      else unset.phone = 1;
    }
    if (me.role === "student" && d.address !== undefined) set.address = d.address;

    // Photo: students only, stored as a plain URL. Empty = remove.
    if (me.role === "student" && d.image !== undefined) {
      if (d.image) set.image = d.image;
      else unset.image = 1;
    }

    try {
      await User.updateOne({ _id: me.id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
    } catch (e) {
      if (typeof e === "object" && e && "code" in e && (e as { code: number }).code === 11000) throw new AppError("This mobile number is already used by another account.");
      throw e;
    }
    revalidatePath("/dashboard", "layout");
    return "Profile updated.";
  });
}
