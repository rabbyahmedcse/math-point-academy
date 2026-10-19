"use client";

import type { ReactNode } from "react";

/** <select> that submits its parent GET form as soon as it changes. */
export function AutoSelect({ name, defaultValue, className, children }: { name: string; defaultValue?: string; className?: string; children: ReactNode }) {
  return (
    <select name={name} defaultValue={defaultValue} className={className} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {children}
    </select>
  );
}
