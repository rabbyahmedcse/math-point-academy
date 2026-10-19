"use server";

import { revalidatePath } from "next/cache";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { connectDB } from "@/lib/db";
import { requireActionUser, getCurrentUser } from "@/lib/session";
import { oid } from "@/lib/access";
import { teacherCreateSchema, teacherUpdateSchema, settingsSchema } from "@/lib/validators";
import { createCredentialUser, resetPassword, DEFAULT_TEACHER_PERMISSIONS } from "@/lib/users";
import { audit } from "@/lib/audit";
import { User } from "@/models/User";
import { Settings } from "@/models/Misc";

const refresh = () => revalidatePath("/dashboard", "layout");

export async function createTeacher(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    const d = teacherCreateSchema.parse(Object.fromEntries(fd));
    const u = await createCredentialUser({
      name: d.name, email: d.email, password: d.password, role: "teacher", status: "active",
      mustChangePassword: true, // temporary password -> must be changed on first login
      extra: { phone: d.phone || undefined, permissions: DEFAULT_TEACHER_PERMISSIONS },
    });
    await audit(me, "teacher.create", "User", u.id, d.email);
    refresh();
    return `Teacher account created. Share the temporary password with ${d.name} securely.`;
  });
}

export async function updateTeacher(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    await connectDB();
    const d = teacherUpdateSchema.parse(Object.fromEntries(fd));
    await User.updateOne({ _id: oid(d.id), role: "teacher" }, { $set: { name: d.name, phone: d.phone || undefined, updatedAt: new Date() } });
    await audit(me, "teacher.update", "User", d.id);
    refresh();
    return "Teacher profile updated.";
  });
}

export async function resetTeacherPassword(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    await connectDB();
    const id = String(fd.get("id"));
    const pw = String(fd.get("password") ?? "");
    if (pw.length < 8) throw new AppError("Password must be at least 8 characters.");
    const t = await User.findOne({ _id: oid(id), role: { $in: ["teacher", "student"] } }, { _id: 1 }).lean();
    if (!t) throw new AppError("User not found.");
    await resetPassword(id, pw);
    await audit(me, "password.reset", "User", id);
    return "Password reset. The user must change it at next sign-in.";
  });
}

/** Turn individual teacher permissions on/off (checkbox present = enabled). */
export async function updatePermissions(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    await connectDB();
    const id = String(fd.get("id"));
    const keys = Object.keys(DEFAULT_TEACHER_PERMISSIONS);
    const permissions = Object.fromEntries(keys.map((k) => [k, fd.get(k) === "on"]));
    await User.updateOne({ _id: oid(id), role: "teacher" }, { $set: { permissions } });
    await audit(me, "teacher.permissions", "User", id, JSON.stringify(permissions));
    refresh();
    return "Permissions updated.";
  });
}

export async function saveSettings(_p: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const me = await requireActionUser(["admin"]);
    await connectDB();
    const d = settingsSchema.parse(Object.fromEntries(fd));
    await Settings.updateOne({ _id: "main" }, { $set: d }, { upsert: true });
    await audit(me, "settings.update", "Settings", "main");
    refresh();
    return "Settings saved.";
  });
}

/** After a successful authClient.changePassword on the client, clear the "must change" flag. */
export async function clearMustChangePassword() {
  const me = await getCurrentUser();
  if (!me) return;
  await connectDB();
  await User.updateOne({ _id: me.id }, { $set: { mustChangePassword: false } });
  revalidatePath("/dashboard", "layout");
}
