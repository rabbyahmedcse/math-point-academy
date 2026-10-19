"use client";

import Link from "next/link";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { registerStudent } from "@/actions/auth";

export function RegisterForm() {
  return (
    <ActionForm action={registerStudent} submitLabel="Submit registration" submitClassName="btn btn-primary w-full" className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name"><input name="name" required className="input" /></Field>
        <Field label="Class (e.g. Class 9)"><input name="className" required className="input" /></Field>
        <Field label="Email"><input name="email" type="email" required className="input" autoComplete="email" /></Field>
        <Field label="Your mobile"><input name="phone" required className="input" placeholder="01XXXXXXXXX" inputMode="tel" /></Field>
        <Field label="Guardian name"><input name="guardianName" required className="input" /></Field>
        <Field label="Guardian mobile"><input name="guardianPhone" required className="input" placeholder="01XXXXXXXXX" inputMode="tel" /></Field>
      </div>
      <Field label="Address (optional)"><input name="address" className="input" /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Password (min 8)"><input name="password" type="password" required minLength={8} className="input" autoComplete="new-password" /></Field>
        <Field label="Confirm password"><input name="confirmPassword" type="password" required minLength={8} className="input" autoComplete="new-password" /></Field>
      </div>
      <p className="text-xs text-slate-500">
        Use a password made for this system — never your Gmail password. Your account stays <b>pending</b> until a teacher approves it.
        Already registered? <Link href="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>
      </p>
    </ActionForm>
  );
}
