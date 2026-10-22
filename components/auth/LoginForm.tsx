
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const identifier = String(fd.get("identifier") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    // One form for everyone: e-mail (staff/students) or Student ID.
    const { error } = identifier.includes("@")
      ? await authClient.signIn.email({
          email: identifier,
          password,
        })
      : await authClient.signIn.username({
          username: identifier,
          password,
        });

    if (error) {
      setError(error.message || "Invalid credentials.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative space-y-5"
    >
      {/* Identifier */}
      <label className="group block">
        <span className="mb-2 block text-sm font-bold text-slate-700 transition-colors group-focus-within:text-indigo-700">
          Email or Student ID
        </span>

        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-indigo-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>

          <input
            name="identifier"
            type="text"
            required
            autoComplete="username"
            placeholder="you@gmail.com or STU-2026-XXXX"
            className="w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-indigo-200 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:text-base"
          />
        </div>
      </label>

      {/* Password */}
      <label className="group block">
        <span className="mb-2 block text-sm font-bold text-slate-700 transition-colors group-focus-within:text-indigo-700">
          Password
        </span>

        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-indigo-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect x="4" y="10" width="16" height="11" rx="2.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <path d="M12 14v3" />
            </svg>
          </span>

          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-indigo-200 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:text-base"
          />
        </div>
      </label>

      {/* Authentication error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white p-3.5 text-sm text-rose-700 shadow-sm"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 font-extrabold text-rose-600"
          >
            !
          </span>

          <p className="min-w-0 flex-1 break-words pt-1 leading-5">
            {error}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:text-base"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />

        {loading ? (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 animate-spin"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign in</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </>
        )}
      </button>

      {/* Registration links */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            New to Math Point Academy?
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Link
          href="/register"
          className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md hover:shadow-indigo-950/[0.04]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-105 group-hover:bg-indigo-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="9" cy="8" r="4" />
              <path d="M3 21v-2a6 6 0 0 1 12 0v2M19 8v6M16 11h6" />
            </svg>
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-slate-800">
              Student registration
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Create your student account
            </span>
          </span>

          <span
            aria-hidden="true"
            className="text-lg text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-600"
          >
            →
          </span>
        </Link>

        <Link
          href="/register/parent"
          className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-md hover:shadow-violet-950/[0.04]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:scale-105 group-hover:bg-violet-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="9" cy="8" r="3.5" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M2.5 20v-1.5a6.5 6.5 0 0 1 13 0V20M15 15.5a5 5 0 0 1 6.5 4.5" />
            </svg>
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-slate-800">
              Parent registration
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Create a parent account
            </span>
          </span>

          <span
            aria-hidden="true"
            className="text-lg text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-600"
          >
            →
          </span>
        </Link>
      </div>
    </form>
  );
}
