import "server-only";
import { auth } from "./auth";
import { connectDB } from "./db";
import { AppError } from "./action";
import { User, type PermissionKey, type Role, type UserStatus } from "@/models/User";

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
  username?: string;
  studentId?: string;
  mustChangePassword?: boolean;
  /** Domain fields outside Better Auth's schema (phone, guardian, permissions …). */
  extra?: Record<string, unknown>;
}

/**
 * Creates a credential (email+password) account WITHOUT opening a session.
 * (Using the public sign-up endpoint from a server action would log the admin in as the new
 * user via nextCookies — so we use Better Auth's internal adapter + its own password hasher.)
 */
export async function createCredentialUser(input: NewUser) {
  await connectDB();
  const ctx = await auth.$context;
  const email = input.email.toLowerCase().trim();

  if (await ctx.internalAdapter.findUserByEmail(email)) {
    throw new AppError("An account with this email already exists.");
  }
  const hash = await ctx.password.hash(input.password);

  const user = await ctx.internalAdapter.createUser({
    email,
    name: input.name.trim(),
    emailVerified: false,
    role: input.role,
    status: input.status,
    studentId: input.studentId,
    mustChangePassword: input.mustChangePassword ?? false,
    ...(input.username ? { username: input.username.toLowerCase(), displayUsername: input.username } : {}),
  }, { method: "admin" });

  try {
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hash,
    });
    if (input.extra) await User.updateOne({ _id: user.id }, { $set: input.extra });
  } catch (e) {
    await ctx.internalAdapter.deleteUser(user.id); // roll back half-created account
    throw e;
  }
  return user;
}

/** Admin-initiated reset: new temporary password, all sessions revoked, must change on first login. */
export async function resetPassword(userId: string, newPassword: string) {
  await connectDB();
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(newPassword);
  await ctx.internalAdapter.updatePassword(userId, hash);
  await ctx.internalAdapter.deleteSessions([userId]);
  await User.updateOne({ _id: userId }, { $set: { mustChangePassword: true, updatedAt: new Date() } });
}

export async function revokeSessions(userId: string) {
  const ctx = await auth.$context;
  await ctx.internalAdapter.deleteSessions([userId]);
}

export const DEFAULT_TEACHER_PERMISSIONS: Record<PermissionKey, boolean> = {
  manageBatches: true,
  approveStudents: true,
  feeEntry: true,
  noticeAll: false,
};
