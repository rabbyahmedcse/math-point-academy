import { ZodError } from "zod";

export type ActionState = { ok: boolean; message?: string };
export const idle: ActionState = { ok: false };

/** Expected, user-facing error (validation / permission / business rule). */
export class AppError extends Error {}

/**
 * Wraps a server-action body: returns {ok,message} instead of throwing, turns
 * validation / duplicate-key / app errors into friendly messages and hides internals.
 */
export async function runAction(fn: () => Promise<string | void>): Promise<ActionState> {
  try {
    const message = await fn();
    return { ok: true, message: message ?? "Saved." };
  } catch (e) {
    if (e instanceof AppError) return { ok: false, message: e.message };
    if (e instanceof ZodError) return { ok: false, message: e.issues[0]?.message ?? "Invalid input." };
    if (typeof e === "object" && e && "code" in e && (e as { code: number }).code === 11000) {
      return { ok: false, message: "A record with the same unique value already exists." };
    }
    console.error("[action error]", e);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
