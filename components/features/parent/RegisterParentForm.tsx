"use client";

import Link from "next/link";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { registerParent } from "@/actions/parent";
import { RELATIONSHIPS } from "@/lib/relationship";

export function RegisterParentForm() {
  return (
    <ActionForm action={registerParent} submitLabel="Create Parent Account" submitClassName="btn btn-primary w-full" className="space-y-4">
      <Field label="Parent Full Name *"><input name="name" required className="input" placeholder="Enter your full name" autoComplete="name" /></Field>
      <Field label="Email / Gmail *"><input name="email" type="email" required className="input" placeholder="parent@example.com" autoComplete="email" /></Field>
      <Field label="Mobile Number *"><input name="phone" required className="input" placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" /></Field>

      <fieldset>
        <legend className="label">Relationship with Student *</legend>
        <div className="space-y-2">
          {RELATIONSHIPS.map((r, i) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="relationship" value={r.value} defaultChecked={i === 0} className="h-4 w-4 accent-indigo-600" /> {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Field label="Student ID *"><input name="studentId" required className="input uppercase" placeholder="e.g. STU-2026-0001" autoCapitalize="characters" /></Field>
        <p className="mt-1 text-xs text-slate-500">Enter your child&apos;s Coaching Student ID (সন্তানের Coaching Student ID দিতে হবে).</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Password * (min 8)"><input name="password" type="password" required minLength={8} className="input" autoComplete="new-password" /></Field>
        <Field label="Confirm password *"><input name="confirmPassword" type="password" required minLength={8} className="input" autoComplete="new-password" /></Field>
      </div>

      <p className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
        <b>How verification works:</b> we check the Student ID and compare your mobile number with the guardian number given when the student registered.
        If they match, your child is linked instantly — and <b>all your other children</b> registered with the same guardian number are added automatically. If not, a teacher or admin will verify the link manually.
      </p>
      <p className="text-center text-sm text-slate-600">
        Already have an account? <Link href="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>
      </p>
    </ActionForm>
  );
}
