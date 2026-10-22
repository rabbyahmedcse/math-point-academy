"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { XIcon } from "./icons";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) {
          onClose();
        }
      }}
      className={cn(
        "m-auto w-[calc(100%-1.25rem)] max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white p-0 text-left text-slate-900 shadow-[0_25px_100px_-20px_rgba(15,23,42,0.4)] backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm",
        "open:animate-in open:fade-in open:zoom-in-95 open:duration-200",
        className,
      )}
    >
      {open && (
        <div className="relative max-h-[90dvh] overflow-y-auto overscroll-contain">
          {/* Decorative gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-indigo-50 via-violet-50/70 to-white"
          />

          {/* Header */}
          <header className="relative flex items-start justify-between gap-4 border-b border-slate-100/90 px-4 py-5 sm:px-7 sm:py-6">
            <div className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 3v18M3 12h18" />
                </svg>
              </span>

              <div className="min-w-0 pt-0.5">
                <h2
                  id={titleId}
                  className="break-words text-lg font-black tracking-tight text-slate-900 sm:text-2xl"
                >
                  {title}
                </h2>

                {subtitle && (
                  <p
                    id={subtitleId}
                    className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6"
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 text-slate-500 shadow-sm transition-all duration-200 hover:rotate-90 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:h-10 sm:w-10"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </header>

          {/* Modal content */}
          <div className="relative px-4 py-5 sm:px-7 sm:py-6">
            {children}
          </div>
        </div>
      )}
    </dialog>
  );
}