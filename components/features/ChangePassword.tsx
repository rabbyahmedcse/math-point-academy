
"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { clearMustChangePassword } from "@/actions/admin";
import {
  CheckCircleIcon,
  CircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// Existing password policy
const MIN = 8;
const MAX = 128;

function strength(pw: string) {
  if (!pw) return { bars: 0, label: "", cls: "" };

  const score =
    (pw.length >= 8 ? 1 : 0) +
    (pw.length >= 12 ? 1 : 0) +
    (/[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);

  if (score <= 2)
    return {
      bars: 1,
      label: "Weak",
      cls: "bg-rose-500 text-rose-600",
    };

  if (score === 3)
    return {
      bars: 2,
      label: "Fair",
      cls: "bg-amber-500 text-amber-700",
    };

  if (score === 4)
    return {
      bars: 3,
      label: "Good",
      cls: "bg-lime-500 text-lime-700",
    };

  return {
    bars: 4,
    label: "Strong",
    cls: "bg-emerald-500 text-emerald-700",
  };
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  aside,
  below,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  aside?: ReactNode;
  below?: ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="group/field min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={name}
          className="text-sm font-bold text-slate-700 transition-colors group-focus-within/field:text-indigo-700"
        >
          {label}
        </label>

        {aside}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center">
          <LockIcon className="h-[18px] w-[18px] text-slate-400 transition-colors group-focus-within/field:text-indigo-600" />
        </div>

        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={MAX}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-13 w-full rounded-xl border border-slate-200/90 bg-white/90 py-3 pl-12 pr-12 text-sm text-slate-800 shadow-sm shadow-slate-900/[0.02] outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />

        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={
            show
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={show}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
        >
          {show ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {below}
    </div>
  );
}

function Req({
  ok,
  children,
}: {
  ok: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200",
        ok
          ? "bg-emerald-50/80 text-emerald-800"
          : "text-slate-500"
      )}
    >
      {ok ? (
        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
      )}

      <span className="leading-5">{children}</span>

      <span className="sr-only">
        {ok ? " — met" : " — not met yet"}
      </span>
    </li>
  );
}

export function ChangePassword({
  accountHref,
}: {
  accountHref: string;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  const st = strength(next);
  const longEnough = next.length >= MIN;
  const matches = next !== "" && next === confirm;
  const different =
    next !== "" && current !== "" && next !== current;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setMsg(null);

    if (next.length < MIN) {
      return setMsg({
        ok: false,
        text: `New password must be at least ${MIN} characters.`,
      });
    }

    if (next !== confirm) {
      return setMsg({
        ok: false,
        text: "The new passwords do not match.",
      });
    }

    if (next === current) {
      return setMsg({
        ok: false,
        text: "New password must be different from the current one.",
      });
    }

    setBusy(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });

      if (error) {
        setMsg({
          ok: false,
          text: error.message ?? "Could not change password.",
        });
        return;
      }

      await clearMustChangePassword();

      setCurrent("");
      setNext("");
      setConfirm("");

      setMsg({
        ok: true,
        text: "Password changed. Other devices have been signed out.",
      });
    } catch {
      setMsg({
        ok: false,
        text: "Could not reach the server. Check your connection and try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative isolate overflow-hidden rounded-3xl border border-indigo-100/80 bg-white shadow-[0_20px_70px_-35px_rgba(79,70,229,0.28)]"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-64 w-64 rounded-full bg-indigo-200/25 blur-3xl"
      />

      {/* Header */}
      <div className="relative border-b border-white/10 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg shadow-indigo-950/10 backdrop-blur-md transition-transform duration-300 hover:rotate-3 hover:scale-105 sm:h-14 sm:w-14">
            <ShieldIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                Change Password
              </h2>

              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-50">
                Security
              </span>
            </div>

            <p className="max-w-xl text-sm leading-6 text-indigo-100">
              Protect your account by choosing a new password. Other active
              sessions will be signed out after a successful change.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-indigo-100">
          <LockIcon className="h-4 w-4" />
          <span>Secure password update</span>
          <span className="h-1 w-1 rounded-full bg-indigo-200" />
          <span>8–128 characters</span>
        </div>
      </div>

      {/* Form content */}
      <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8 lg:p-8">
        <div className="min-w-0 space-y-6">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={current}
            onChange={setCurrent}
            placeholder="Enter your current password"
            autoComplete="current-password"
            aside={
              <button
                type="button"
                onClick={() => setForgot((f) => !f)}
                aria-expanded={forgot}
                aria-controls="forgot-msg"
                className="rounded-lg px-1 py-1 text-xs font-bold text-indigo-600 transition-colors hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
              >
                Forgot password?
              </button>
            }
            below={
              forgot && (
                <p
                  id="forgot-msg"
                  role="status"
                  className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm leading-6 text-indigo-800"
                >
                  Password recovery will be available soon.
                </p>
              )
            }
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            value={next}
            onChange={setNext}
            placeholder="Create a new password"
            autoComplete="new-password"
            below={
              next && (
                <div
                  className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                  aria-live="polite"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Password strength
                    </span>

                    <span
                      className={cn(
                        "text-xs font-extrabold",
                        st.cls.split(" ")[1]
                      )}
                    >
                      {st.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          i <= st.bars
                            ? st.cls.split(" ")[0]
                            : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )
            }
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            below={
              confirm && (
                <p
                  className={cn(
                    "mt-2 flex items-center gap-1.5 text-xs font-semibold",
                    matches ? "text-emerald-700" : "text-rose-600"
                  )}
                >
                  {matches
                    ? "✓ Passwords match"
                    : "Passwords do not match yet"}
                </p>
              )
            }
          />

          {/* Result message */}
          {msg && (
            <div
              role={msg.ok ? "status" : "alert"}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6",
                msg.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold",
                  msg.ok
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                )}
                aria-hidden="true"
              >
                {msg.ok ? "✓" : "!"}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-semibold">{msg.text}</p>

                {msg.ok && (
                  <Link
                    href={accountHref}
                    className="mt-1 inline-flex font-bold underline decoration-emerald-400 underline-offset-4 hover:text-emerald-950"
                  >
                    Back to My Account
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href={accountHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={busy}
              className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />

              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  <span className="relative">Saving...</span>
                </>
              ) : (
                <>
                  <ShieldIcon className="relative h-5 w-5" />
                  <span className="relative">Change Password</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Password requirements */}
        <aside
          aria-label="Password requirements"
          className="h-fit rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 p-4 shadow-sm sm:p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldIcon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-800">
                Password checklist
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Complete all requirements
              </p>
            </div>
          </div>

          <ul className="space-y-2">
            <Req ok={longEnough}>
              At least {MIN} characters
            </Req>
            <Req ok={different}>
              Different from your current password
            </Req>
            <Req ok={matches}>
              Both new passwords match
            </Req>
          </ul>

          <div className="mt-4 rounded-xl border border-white bg-white/80 p-3">
            <div className="flex items-start gap-2">
              <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <p className="text-xs leading-5 text-slate-600">
                Never share your password with anyone. Use a password that
                you do not use for other accounts.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
