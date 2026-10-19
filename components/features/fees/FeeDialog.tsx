"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Button + native <dialog> modal. Content is server-rendered and passed in as children. */
export function FeeDialog({ label, variant, icon, title, subtitle, children }: {
  label: string; variant: "primary" | "outline"; icon: ReactNode; title: string; subtitle: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={cn(
          "inline-flex w-full min-w-40 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
          variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-300 bg-white text-blue-700 hover:bg-slate-50",
        )}
      >
        {icon}
        {label}
      </button>
      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 text-left shadow-2xl backdrop:bg-slate-900/50"
      >
        <div className="max-h-[85vh] overflow-y-auto p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            <button type="button" aria-label="Close" onClick={() => ref.current?.close()} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
