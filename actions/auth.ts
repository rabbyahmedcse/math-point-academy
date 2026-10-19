"use server";

import { connectDB } from "@/lib/db";
import { runAction, AppError, type ActionState } from "@/lib/action";
import { registerSchema } from "@/lib/validators";
import { createCredentialUser } from "@/lib/users";
import { nextStudentId } from "@/lib/student-id";
import { User } from "@/models/User";

/**
 * PUBLIC student self-registration.
 *  1. validate  2. reject duplicates (email / phone)  3. atomically generate STU-YYYY-NNNN
 *  4. create credential account with status "pending" (no session is created)
 * The student cannot sign in until a teacher/admin approves and assigns a batch
 * (enforced by the session.create hook in lib/auth.ts).
 */
export async function registerStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const d = registerSchema.parse(Object.fromEntries(formData));
    await connectDB();

    const email = d.email.toLowerCase();
    if (await User.exists({ $or: [{ email }, { role: "student", phone: d.phone }] })) {
      throw new AppError("An account with this email or phone number already exists.");
    }

    const studentId = await nextStudentId();
    await createCredentialUser({
      name: d.name,
      email,
      password: d.password,
      role: "student",
      status: "pending",
      studentId,
      username: studentId, // students may sign in with their Student ID
      extra: {
        phone: d.phone,
        className: d.className,
        guardianName: d.guardianName,
        guardianPhone: d.guardianPhone,
        address: d.address ?? "",
      },
    });

    return `Registration submitted! Your Student ID is ${studentId}. Keep it safe — you can sign in with it once a teacher approves your account.`;
  });
}
