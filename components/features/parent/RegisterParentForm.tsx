
"use client";

import Link from "next/link";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { registerParent } from "@/actions/parent";
import { RELATIONSHIPS } from "@/lib/relationship";
import { cn } from "@/lib/utils";


const inputClass =
  "input w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

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
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export function RegisterParentForm() {
  return (
    <div className="relative isolate">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-100/70 via-white to-violet-100/70 blur-2xl"
      />

      <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_24px_80px_-30px_rgba(79,70,229,0.3)] backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_30px_90px_-30px_rgba(79,70,229,0.36)]">
        {/* Header */}
      

        {/* Form */}
        <div className="p-5 sm:p-8">
          <ActionForm
            action={registerParent}
            submitLabel="Create Parent Account"
            submitClassName="group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0"
            className="space-y-7"
          >
            {/* Section 1: Parent details */}
            <section>
              <SectionHeading
                number="01"
                title="Parent information"
                description="Enter your name and contact details."
              />

              <div className="space-y-4">
                <Field label="Parent Full Name *">
                  <input
                    name="name"
                    required
                    className={inputClass}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </Field>

                <Field label="Email / Gmail *">
                  <input
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                    placeholder="you@gmail.com"
                    autoComplete="email"
                  />
                </Field>

                <Field label="Mobile Number *">
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

            {/* Section 2: Relationship */}
            <section>
              <SectionHeading
                number="02"
                title="Relationship with student"
                description="Select your relationship with the student."
              />

              <fieldset className="min-w-0">
                <legend className="mb-3 text-sm font-semibold text-slate-700">
                  Relationship with Student *
                </legend>

                <div className="grid gap-2 sm:grid-cols-2">
                  {RELATIONSHIPS.map((r, i) => (
                    <label
                      key={r.value}
                      className="group flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50/60 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-800 has-[:checked]:shadow-sm has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-indigo-500/15"
                    >
                      <input
                        type="radio"
                        name="relationship"
                        value={r.value}
                        defaultChecked={i === 0}
                        className="h-4 w-4 shrink-0 accent-indigo-600"
                      />

                      <span className="flex-1 font-medium">{r.label}</span>

                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-has-[:checked]:bg-indigo-600 group-has-[:checked]:text-white">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <path
                            d="m5 10 3 3 7-7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Section 3: Student verification */}
            <section>
              <SectionHeading
                number="03"
                title="Link your child"
                description="Use the student's official coaching ID."
              />

              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 p-4 sm:p-5">
                <Field label="Student ID *">
                  <input
                    name="studentId"
                    required
                    className={cn(inputClass, "uppercase")}
                    placeholder="e.g. STU-2026-0001"
                    autoCapitalize="characters"
                  />
                </Field>

                <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-600">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600"
                    aria-hidden="true"
                  >
                    <circle cx="10" cy="10" r="7.5" />
                    <path
                      d="M10 9v4m0-7h.01"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p>
                    Enter your child&apos;s Coaching Student ID (সন্তানের
                    Coaching Student ID দিতে হবে).
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Section 4: Password */}
            <section>
              <SectionHeading
                number="04"
                title="Secure your account"
                description="Create a password for your parent account."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Password * (min 8)">
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

                <Field label="Confirm password *">
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

              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                  aria-hidden="true"
                >
                  <rect x="4" y="8" width="12" height="9" rx="2" />
                  <path
                    d="M7 8V5.5a3 3 0 0 1 6 0V8"
                    strokeLinecap="round"
                  />
                </svg>
                Choose a unique password for your Math Point Academy account.
              </p>
            </section>

            {/* Verification information */}
            <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50/70">
              <div className="flex items-center gap-2.5 border-b border-emerald-200/70 px-4 py-3.5 sm:px-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="m10 2 6 2.5v4.2c0 3.7-2.6 6.8-6 8.3-3.4-1.5-6-4.6-6-8.3V4.5L10 2Z"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m7 9.5 2 2 4-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    How verification works
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Your account is linked using student details.
                  </p>
                </div>
              </div>

              <div className="space-y-3 px-4 py-4 text-xs leading-5 text-emerald-950 sm:px-5">
                <p>
                  We check the Student ID and compare your mobile number with
                  the guardian number provided during student registration.
                </p>

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <path
                        d="m5 10 3 3 7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p>
                    <b>If the details match:</b> your child is linked
                    instantly, and <b>all your other children</b> registered
                    with the same guardian number are added automatically.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <circle cx="10" cy="10" r="7" />
                      <path
                        d="M10 6v4m0 3h.01"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <p>
                    <b>If the details do not match:</b> a teacher or admin
                    will verify the link manually.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit button is rendered by ActionForm */}

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
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
        Register securely with Math Point Academy to access your child&apos;s
        academic information.
      </p>
    </div>
  );
}
