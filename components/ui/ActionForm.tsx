"use client";

import {
  useActionState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/action";

export function SubmitButton({
  children,
  className = "btn btn-primary",
  pendingText = "Saving…",
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
            />
          </svg>
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Generic form bound to a server action with pending state and status feedback. */
export function ActionForm({
  action,
  children,
  submitLabel,
  className,
  submitClassName,
  resetOnSuccess = true,
  hideSubmit = false,
}: {
  action: (
    prev: ActionState,
    fd: FormData,
  ) => Promise<ActionState>;
  children?: ReactNode;
  submitLabel?: string;
  className?: string;
  submitClassName?: string;
  resetOnSuccess?: boolean;
  hideSubmit?: boolean;
}) {
  const [state, formAction] = useActionState(
    action,
    { ok: false } as ActionState,
  );

  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) {
      ref.current?.reset();
    }
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      action={formAction}
      className={cn("min-w-0", className)}
    >
      <div className="space-y-3">
        {children}
      </div>

      {state.message && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "mt-4 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-5 shadow-sm",
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          )}
        >
          {state.ok ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
          )}

          <p className="min-w-0 break-words">
            {state.message}
          </p>
        </div>
      )}

      {!hideSubmit && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <SubmitButton
            className={cn(
              "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 active:translate-y-0",
              submitClassName,
            )}
          >
            {submitLabel ?? "Save"}
          </SubmitButton>
        </div>
      )}
    </form>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "group/field block min-w-0 space-y-1.5",
        className,
      )}
    >
      <span className="block text-xs font-bold tracking-wide text-slate-600 transition-colors group-focus-within/field:text-indigo-700">
        {label}
      </span>

      {children}
    </label>
  );
}