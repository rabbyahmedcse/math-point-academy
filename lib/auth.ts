import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { ObjectId } from "mongodb";
import { authDb } from "./db";

/**
 * One login for every role.
 *  - Staff sign in with e-mail + password.
 *  - Students sign in with their Student ID (username) OR e-mail + password.
 *
 * Accounts are NEVER created through the public sign-up endpoint (disableSignUp):
 *  - students register through our `registerStudent` server action (status = pending)
 *  - admin/teacher accounts are created by an admin (see lib/users.ts)
 * so nobody can self-assign a role by calling /api/auth/sign-up/email directly.
 */
export const auth = betterAuth({
  database: mongodbAdapter(authDb),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Passwords are hashed with scrypt by Better Auth and stored in the `account` collection.
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  user: {
    additionalFields: {
      // input:false => a client can never set these.
      role: { type: "string", required: false, defaultValue: "student", input: false },
      status: { type: "string", required: false, defaultValue: "pending", input: false },
      studentId: { type: "string", required: false, input: false },
      mustChangePassword: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },

  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      // Student IDs look like STU-2026-0001 (hyphens are not allowed by default).
      usernameValidator: (value) => /^[a-z0-9._-]+$/i.test(value),
    }),
    nextCookies(), // must be last: lets server actions set the session cookie
  ],

  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-in/username": { window: 60, max: 5 },
    },
  },

  databaseHooks: {
    session: {
      create: {
        // Hard gate: pending / rejected / inactive users can never obtain a session,
        // so "no access until approved" holds even if the UI is bypassed.
        before: async (session) => {
          const u = await authDb
            .collection("user")
            .findOne({ _id: new ObjectId(session.userId) }, { projection: { status: 1 } });
          const messages: Record<string, string> = {
            pending: "Your registration is pending approval by a teacher or admin.",
            rejected: "Your registration was not approved. Please contact the coaching center.",
            inactive: "Your account is deactivated. Please contact the coaching center.",
          };
          if (!u || u.status !== "active") {
            throw new APIError("FORBIDDEN", {
              message: messages[u?.status as string] ?? "This account cannot sign in.",
            });
          }
          return { data: session };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
