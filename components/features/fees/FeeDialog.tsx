
"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FeeDialog({
  label,
  variant,
  icon,
  title,
  subtitle,
  children,
}: {
  label: string;
  variant: "primary" | "outline";
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={cn(
          "group relative inline-flex min-h-11 w-full min-w-40 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-bold",
          "transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/25",
          variant === "primary"
            ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30"
            : "border border-indigo-200 bg-white/90 text-indigo-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md",
        )}
      >
        {variant === "primary" && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
        )}

        <span className="relative flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>

        <span className="relative">{label}</span>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="relative ml-auto h-4 w-4 shrink-0 opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
        >
          <path
            d="m7 4 6 6-6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dialog Modal */}
      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className={cn(
          "m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-3xl p-0",
          "border border-white/70 bg-white/95 text-left text-slate-800",
          "shadow-[0_30px_100px_-25px_rgba(15,23,42,0.4)] backdrop:bg-slate-950/60",
          "backdrop:backdrop-blur-sm",
          "open:animate-[feeDialogIn_220ms_ease-out]",
        )}
      >
        {/* Modal Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-5 py-5 text-white sm:px-7 sm:py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full border-[22px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-violet-400/20 blur-2xl"
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
                <span className="flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
                  {icon}
                </span>
              </div>

              <div className="min-w-0 pt-0.5">
                <h3 className="text-lg font-extrabold tracking-tight sm:text-xl">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-5 text-indigo-100">
                  {subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close dialog"
              onClick={() => ref.current?.close()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-200 hover:rotate-90 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="m18 6-12 12M6 6l12 12"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="relative mt-5 h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
          <p className="relative mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-100/80">
            Math Point Academy · Fee Management
          </p>
        </div>

        {/* Modal Content */}
        <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain p-5 sm:max-h-[75dvh] sm:p-7">
          <div className="animate-[feeContentIn_300ms_ease-out]">
            {children}
          </div>
        </div>
      </dialog>

      {/* Modal animation */}
      <style jsx>{`
        @keyframes feeDialogIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes feeContentIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          dialog,
          dialog *,
          button {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
