"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser } from "@/lib/session";
import { profileSchema } from "@/lib/validators";
import { buildProfileUpdate } from "@/lib/profile-rules";
import { User } from "@/models/User";

/**
 * Update the signed-in user's OWN profile (the target is always the session user — no id is ever read from the request).
 * The per-role rules live in lib/profile-rules.ts (unit-tested). In short:
 *   admin / teacher : name, mobile, address, photo link
 *   student         : mobile, address, photo link (name is set by the coaching center)
 *   parent          : name, address, photo link — the registered MOBILE NUMBER CANNOT BE CHANGED (rejected here,
 *                     whatever the client sends); it links the parent to their children.
 * E-mail, role, status, Student ID, class/batch and every other field are never written by this action.
 */
export async function updateProfile(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin", "teacher", "student", "parent"]);
    const d = profileSchema.parse(Object.fromEntries(fd));

    // me.phone / me.role come from the database (getCurrentUser), never from the request.
    const change = buildProfileUpdate(me.role, me.phone, d);
    if (!change.ok) throw new AppError(change.error);

    await connectDB();
    try {
      await User.updateOne(
        { _id: me.id },
        { $set: { ...change.set, updatedAt: new Date() }, ...(Object.keys(change.unset).length ? { $unset: change.unset } : {}) },
      );
    } catch (e) {
      if (typeof e === "object" && e && "code" in e && (e as { code: number }).code === 11000) throw new AppError("This mobile number is already used by another account.");
      throw e;
    }
    revalidatePath("/dashboard", "layout"); // header name / photo + My Account refresh
    return "Profile updated.";
  });
}
