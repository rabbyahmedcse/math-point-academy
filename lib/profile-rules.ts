/**
 * Who may change what on their OWN profile — decided on the server, never in the UI.
 * Pure (no DB / framework imports) so the policy is unit-tested in tests/profile-rules.test.ts.
 *
 *   admin / teacher : name, mobile (optional), address, image link
 *   student         : mobile (required), address, image link.  Name is set by the coaching center.
 *   parent          : name, address, image link.  The registered MOBILE NUMBER IS IMMUTABLE here
 *                     (it is what links a parent to their children).
 * E-mail, role, status, Student ID, class/batch and every other field are never touched.
 */

export type ProfileRole = "admin" | "teacher" | "student" | "parent";

export interface ProfileInput {
  name?: string;
  phone?: string;
  address?: string;
  image?: string;
}

export type ProfileChange =
  | { ok: true; set: Record<string, unknown>; unset: Record<string, 1> }
  | { ok: false; error: string };

/** 01712345678 / +8801712345678 / 8801712345678 -> 01712345678 */
const normalizePhone = (p?: string | null) => {
  const d = (p ?? "").replace(/\D/g, "");
  return d.length === 13 && d.startsWith("88") ? d.slice(2) : d;
};

export const PARENT_PHONE_LOCKED_MESSAGE =
  "Parents cannot change their registered mobile number. Please contact the coaching center.";

export function buildProfileUpdate(role: ProfileRole, currentPhone: string | undefined, input: ProfileInput): ProfileChange {
  const set: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};

  // ---- name: students cannot rename themselves (existing policy) ----
  if (role !== "student" && input.name) set.name = input.name;

  // ---- mobile ----
  if (input.phone !== undefined) {
    if (role === "parent") {
      // Never written for a parent. Resubmitting the SAME number is harmless; anything else is rejected.
      if (input.phone !== "" && normalizePhone(input.phone) !== normalizePhone(currentPhone)) {
        return { ok: false, error: PARENT_PHONE_LOCKED_MESSAGE };
      }
      if (input.phone === "" && normalizePhone(currentPhone) !== "") {
        return { ok: false, error: PARENT_PHONE_LOCKED_MESSAGE };
      }
    } else if (input.phone) {
      set.phone = input.phone;
    } else if (role === "student") {
      return { ok: false, error: "Mobile number is required." };
    } else {
      unset.phone = 1;
    }
  }

  // ---- address / photo link: every role, own profile only ----
  if (input.address !== undefined) set.address = input.address;
  if (input.image !== undefined) {
    if (input.image) set.image = input.image;
    else unset.image = 1;
  }

  return { ok: true, set, unset };
}
