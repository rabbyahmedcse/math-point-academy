"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { clearMustChangePassword } from "@/actions/admin";
import { EyeIcon, EyeOffIcon, LockIcon, ShieldIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

function strength(pw: string) {
  if (!pw) return { bars: 0, label: "", cls: "" };
  const score = (pw.length >= 8 ? 1 : 0) + (pw.length >= 12 ? 1 : 0) + (/[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 1 : 0) + (/\d/.test(pw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  if (score <= 2) return { bars: 1, label: "Weak", cls: "bg-red-500 text-red-600" };
  if (score === 3) return { bars: 2, label: "Fair", cls: "bg-amber-500 text-amber-600" };
  if (score === 4) return { bars: 3, label: "Good", cls: "bg-lime-500 text-lime-600" };
  return { bars: 4, label: "Strong", cls: "bg-emerald-500 text-emerald-600" };
}

function PasswordField({ label, name, value, onChange, placeholder, autoComplete, below }: {
  label: string; name: string; value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string; below?: ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"><LockIcon className="h-4 w-4 text-slate-500" />{label}</label>
      <div className="relative">
        <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input id={name} name={name} type={show ? "text" : "password"} required value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete} minLength={name === "currentPassword" ? undefined : 8}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-800">
          {show ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      {below}
    </div>
  );
}

export function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const st = strength(next);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) return setMsg({ ok: false, text: "New password must be at least 8 characters." });
    if (next !== confirm) return setMsg({ ok: false, text: "Passwords do not match." });
    if (next === current) return setMsg({ ok: false, text: "New password must be different from the current one." });
    setBusy(true);
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message ?? "Could not change password." });
    await clearMustChangePassword();
    setCurrent(""); setNext(""); setConfirm("");
    setMsg({ ok: true, text: "Password changed. Other devices have been signed out." });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <PasswordField label="Current password" name="currentPassword" value={current} onChange={setCurrent} placeholder="Enter your current password" autoComplete="current-password" />
      <PasswordField label="New password (min 8 characters)" name="newPassword" value={next} onChange={setNext} placeholder="Enter a new password" autoComplete="new-password"
        below={next && (
          <div className="mt-2" aria-live="polite">
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((i) => <span key={i} className={cn("h-1.5 rounded-full", i <= st.bars ? st.cls.split(" ")[0] : "bg-slate-200")} />)}
            </div>
            <p className="mt-1 text-xs text-slate-500">Password strength: <b className={st.cls.split(" ")[1]}>{st.label}</b></p>
          </div>
        )} />
      <PasswordField label="Confirm new password" name="confirm" value={confirm} onChange={setConfirm} placeholder="Confirm your new password" autoComplete="new-password" />
      {msg && <p role="status" className={cn("rounded-lg px-3 py-2 text-sm", msg.ok ? "border border-emerald-100 bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <button disabled={busy} className="btn btn-primary h-12 w-full">
        <ShieldIcon className="h-5 w-5" />{busy ? "Saving…" : "Change Password"}
      </button>
    </form>
  );
}
