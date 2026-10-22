
"use client";

import Link from "next/link";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { registerStudent } from "@/actions/auth";

const inputClass =
  "input w-full rounded-xl border border-slate-200/90 bg-white/80 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/20">
        {number}
      </span>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function RegisterForm() {
  return (
    <div className="relative isolate">
      {/* Ambient background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-100/70 via-white to-violet-100/70 blur-2xl"
      />

      <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_24px_80px_-30px_rgba(79,70,229,0.28)] backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_30px_90px_-30px_rgba(79,70,229,0.35)]">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-5 py-7 text-white sm:px-8 sm:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-violet-400/20 blur-2xl"
          />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="7" r="4" />
                <path
                  d="M20 8v6m3-3h-6"
                  strokeLinecap="round"
                  transform="translate(-1 -1)"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Student Enrollment
              </span>

              
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center gap-3 text-xs text-indigo-100">
            <span className="inline-flex items-center gap-1.5">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="m5 10 3 3 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Simple registration
            </span>
            <span className="h-1 w-1 rounded-full bg-indigo-300" />
            <span>Teacher-approved access</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 sm:p-8">
          <ActionForm
            action={registerStudent}
            submitLabel="Submit registration"
            submitClassName="group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0"
            className="space-y-7"
          >
            {/* Section 1 */}
            <section>
              <SectionHeading
                number="01"
                title="Student information"
                description="Enter your personal and academic details."
              />

              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    name="name"
                    required
                    className={inputClass}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </Field>

                <Field label="Class (e.g. Class 9)">
                  <input
                    name="className"
                    required
                    className={inputClass}
                    placeholder="e.g. Class 9"
                  />
                </Field>

                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                    placeholder="you@gmail.com"
                    autoComplete="email"
                  />
                </Field>

                <Field label="Your mobile">
                  <input
                    name="phone"
                    required
                    className={inputClass}
                    placeholder="01XXXXXXXXX"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Section 2 */}
            <section>
              <SectionHeading
                number="02"
                title="Guardian information"
                description="Provide a guardian's details for communication."
              />

              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                <Field label="Guardian name">
                  <input
                    name="guardianName"
                    required
                    className={inputClass}
                    placeholder="Enter guardian's name"
                  />
                </Field>

                <Field label="Guardian mobile">
                  <input
                    name="guardianPhone"
                    required
                    className={inputClass}
                    placeholder="01XXXXXXXXX"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Address (optional)">
                    <input
                      name="address"
                      className={inputClass}
                      placeholder="House, road, area..."
                      autoComplete="street-address"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Section 3 */}
            <section>
              <SectionHeading
                number="03"
                title="Create your password"
                description="Choose a secure password for your academy account."
              />

              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                <Field label="Password (min 8)">
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className={inputClass}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </Field>

                <Field label="Confirm password">
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className={inputClass}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                </Field>
              </div>
            </section>

            {/* Account notice */}
            <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path
                      d="M12 11v5m0-8h.01"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <div className="min-w-0 text-xs leading-5 text-amber-900">
                  <p className="font-bold">Before you register</p>
                  <p className="mt-1 text-amber-800">
                    Use a password made for this system — never your Gmail
                    password. Your account stays{" "}
                    <strong>pending</strong> until a teacher approves it.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit button is rendered by ActionForm */}

            {/* Sign in link */}
            <p className="text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 underline-offset-4 transition-colors hover:text-violet-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </ActionForm>
        </div>
      </div>

      <p className="mt-5 px-3 text-center text-[11px] leading-5 text-slate-400">
        By submitting this form, you are requesting access to Math Point
        Academy.
      </p>
    </div>
  );
}
