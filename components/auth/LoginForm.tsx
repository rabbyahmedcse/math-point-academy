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
      ? await authClient.signIn.email({ email: identifier, password })
      : await authClient.signIn.username({ username: identifier, password });

    if (error) {
      setError(error.message || "Invalid credentials.");
      setLoading(false);
      return;
    }
    router.push("/dashboard"); // server redirects to the role's dashboard
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="label">Email or Student ID</span>
        <input name="identifier" required autoComplete="username" className="input" placeholder="you@example.com or STU-2026-0001" />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="input" />
      </label>
      {error && <p role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>}
      <button disabled={loading} className="btn btn-primary w-full">{loading ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm text-slate-600">
        New student? <Link href="/register" className="font-medium text-indigo-600 hover:underline">Register here</Link>
      </p>
      <p className="text-center text-sm text-slate-600">
        Parent? <Link href="/register/parent" className="font-medium text-indigo-600 hover:underline">Create a parent account</Link>
      </p>
    </form>
  );
}
