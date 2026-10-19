import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { connectDB } from "./db";
import { AppError } from "./action";
import { User, type Role } from "@/models/User";
import type { SessionUser } from "./types";

/**
 * Resolves the signed-in user from the Better Auth cookie, then re-reads the user from MongoDB
 * so role / status / permissions are always fresh (deactivation or a revoked permission applies
 * immediately — nothing is trusted from the cookie).
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  await connectDB();
  const u = await User.findById(session.user.id).lean();
  if (!u || u.status !== "active") return null;
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    phone: u.phone ?? undefined,
    image: u.role === "student" && u.image && /^https?:\/\//i.test(u.image) ? u.image : undefined,
    studentId: u.studentId ?? undefined,
    className: u.className ?? undefined,
    batchId: u.batchId ? String(u.batchId) : null,
    monthlyFee: u.monthlyFee ?? undefined,
    guardianName: u.guardianName ?? undefined,
    guardianPhone: u.guardianPhone ?? undefined,
    address: u.address ?? undefined,
    mustChangePassword: !!u.mustChangePassword,
    permissions: {
      manageBatches: u.permissions?.manageBatches ?? true,
      approveStudents: u.permissions?.approveStudents ?? true,
      feeEntry: u.permissions?.feeEntry ?? true,
      noticeAll: u.permissions?.noticeAll ?? false,
    },
  };
});

/** For pages / layouts: redirects instead of throwing. */
export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect(`/dashboard/${user.role}`);
  return user;
}

/** For server actions / route handlers: throws AppError (caught by runAction). Re-checked on EVERY call. */
export async function requireActionUser(roles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Your session has expired. Please sign in again.");
  if (!roles.includes(user.role)) throw new AppError("You are not allowed to perform this action.");
  return user;
}
