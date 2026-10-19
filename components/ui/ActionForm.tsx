"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/action";

export function SubmitButton({ children, className = "btn btn-primary", pendingText = "Saving…" }: { children: ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

/** Generic <form> bound to a server action with pending state + success/error message. */
export function ActionForm({
  action, children, submitLabel, className, submitClassName, resetOnSuccess = true, hideSubmit = false,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children?: ReactNode;
  submitLabel?: string;
  className?: string;
  submitClassName?: string;
  resetOnSuccess?: boolean;
  hideSubmit?: boolean;
}) {
  const [state, formAction] = useActionState(action, { ok: false } as ActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {state.message && (
        <p role="status" className={cn("mt-2 rounded-lg px-3 py-2 text-sm", state.ok ? "border border-emerald-100 bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700")}>
          {state.message}
        </p>
      )}
      {!hideSubmit && (
        <div className="mt-3">
          <SubmitButton className={submitClassName}>{submitLabel ?? "Save"}</SubmitButton>
        </div>
      )}
    </form>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
