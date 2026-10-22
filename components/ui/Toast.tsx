"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ExclamationIcon,
  XIcon,
} from "./icons";

/** Small auto-dismissing notification. Render with `message=null` to hide. */
export function Toast({
  message,
  tone = "success",
  onClose,
  ms = 4500,
}: {
  message: string | null;
  tone?: "success" | "error";
  onClose: () => void;
  ms?: number;
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(onClose, ms);

    return () => clearTimeout(timer);
  }, [message, ms, onClose]);

  if (!message) return null;

  const isSuccess = tone === "success";
  const Icon = isSuccess ? CheckCircleIcon : ExclamationIcon;

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={cn(
        "no-print fixed inset-x-3 bottom-3 z-[60] flex animate-fade-in items-start gap-3 overflow-hidden rounded-2xl border bg-white/95 p-3.5 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-full sm:max-w-sm sm:p-4",
        isSuccess
          ? "border-emerald-200/90"
          : "border-rose-200/90",
      )}
    >
      {/* Accent bar */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          isSuccess
            ? "bg-gradient-to-b from-emerald-400 to-teal-500"
            : "bg-gradient-to-b from-rose-400 to-red-500",
        )}
      />

      {/* Status icon */}
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          isSuccess
            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
            : "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      {/* Message */}
      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={cn(
            "text-xs font-extrabold uppercase tracking-wider",
            isSuccess ? "text-emerald-700" : "text-rose-700",
          )}
        >
          {isSuccess ? "Success" : "Something went wrong"}
        </p>

        <p className="mt-1 break-words text-sm leading-5 text-slate-700">
          {message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
}