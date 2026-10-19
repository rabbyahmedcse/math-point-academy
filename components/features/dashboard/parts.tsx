import Link from "next/link";
import type { ReactNode } from "react";
import { cn, longDate } from "@/lib/utils";
import { ArrowRightIcon, CalendarIcon } from "@/components/ui/icons";

/** Flat illustration for the welcome banner (no external image needed). */
export function BannerArt() {
  return (
    <svg viewBox="0 0 440 190" className="h-full w-auto" aria-hidden="true">
      <path d="M0 190C60 128 140 150 210 112S360 66 440 92V190Z" fill="#b9ccf7" opacity=".55" />
      {/* plant */}
      <g transform="translate(112 126)">
        <ellipse cx="-8" cy="14" rx="8" ry="20" fill="#34a853" transform="rotate(-25 -8 14)" />
        <ellipse cx="10" cy="12" rx="8" ry="22" fill="#2e8b57" transform="rotate(22 10 12)" />
        <ellipse cx="1" cy="8" rx="7" ry="22" fill="#43b968" />
        <path d="M-14 38h30l-4 22h-22z" fill="#c2713a" />
      </g>
      {/* student */}
      <path d="M200 132c0-30 22-40 50-40s50 10 50 40v20H200z" fill="#2563eb" />
      <path d="M232 98c4 14 32 14 36 0" fill="#1d4ed8" />
      <circle cx="250" cy="66" r="25" fill="#f8d2b0" />
      <path d="M224 66c-3-30 44-38 52-6-13-10-34-10-52 6z" fill="#1f2937" />
      <circle cx="241" cy="70" r="2.6" fill="#1f2937" /><circle cx="259" cy="70" r="2.6" fill="#1f2937" />
      <path d="M243 80q7 6 14 0" stroke="#b45f3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* laptop */}
      <rect x="168" y="112" width="124" height="68" rx="7" fill="#e5e9f2" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="230" cy="146" r="6" fill="#cbd5e1" />
      <rect x="150" y="178" width="160" height="9" rx="4.5" fill="#cbd5e1" />
      {/* books */}
      <g>
        <rect x="336" y="164" width="92" height="15" rx="3" fill="#1e40af" />
        <rect x="344" y="149" width="78" height="15" rx="3" fill="#60a5fa" />
        <rect x="350" y="134" width="64" height="15" rx="3" fill="#2563eb" />
        <rect x="346" y="168" width="70" height="3" fill="#bfdbfe" />
      </g>
      {/* tagline */}
      <g fill="#1e3a8a" fontStyle="italic" fontFamily="'Segoe Script','Brush Script MT','Comic Sans MS',cursive">
        <text x="318" y="46" fontSize="19" transform="rotate(-12 318 46)">Keep</text>
        <text x="332" y="72" fontSize="19" transform="rotate(-12 332 72)">Learning</text>
        <text x="322" y="98" fontSize="19" transform="rotate(-12 322 98)">Keep Growing</text>
      </g>
    </svg>
  );
}

export function WelcomeBanner({ name }: { name: string }) {
  return (
    <section className="relative mb-6 flex min-h-44 items-center overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-200 px-6 py-6 sm:px-9">
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 140C120 90 220 190 360 130S600 40 800 110V200H0Z" fill="#fff" opacity=".35" />
        <path d="M0 60C140 10 260 90 420 40S660 0 800 50V0H0Z" fill="#fff" opacity=".3" />
      </svg>
      <div className="relative z-10 max-w-xl">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Hi, {name} <span aria-hidden>👋</span></h1>
        <p className="mt-2 text-base text-slate-700 sm:text-lg">Here&apos;s your coaching overview for today.</p>
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700"><CalendarIcon className="h-5 w-5 text-blue-600" />{longDate()}</p>
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-[52%] items-end justify-end pr-2 md:flex lg:w-[46%]"><BannerArt /></div>
    </section>
  );
}

const TILE_TONES = {
  green: { box: "bg-emerald-100 text-emerald-600", value: "text-emerald-600", card: "bg-white border-slate-200", btn: "" },
  red: { box: "bg-red-100 text-red-500", value: "text-red-600", card: "bg-red-50/70 border-red-100", btn: "bg-red-100 text-red-500 hover:bg-red-200" },
  purple: { box: "bg-violet-100 text-violet-600", value: "text-slate-800", card: "bg-white border-slate-200", btn: "bg-violet-100 text-violet-600 hover:bg-violet-200" },
  blue: { box: "bg-blue-100 text-blue-600", value: "text-slate-800", card: "bg-white border-slate-200", btn: "bg-blue-100 text-blue-600 hover:bg-blue-200" },
} as const;

/** Square stat tile: icon box, label, big value, hint, and either a ring (right) or an arrow link. */
export function StatTile({ tone, icon, label, value, hint, href, right }: {
  tone: keyof typeof TILE_TONES; icon: ReactNode; label: string; value: ReactNode; hint: string; href?: string; right?: ReactNode;
}) {
  const t = TILE_TONES[tone];
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border p-5 shadow-sm", t.card)}>
      <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl", t.box)}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</p>
        <p className={cn("text-3xl font-extrabold leading-tight", t.value)}>{value}</p>
        <p className="truncate text-sm text-slate-500">{hint}</p>
      </div>
      {right}
      {href && <Link href={href} aria-label={`Open ${label}`} className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", t.btn)}><ArrowRightIcon className="h-4 w-4" /></Link>}
    </div>
  );
}

/** Donut for the attendance percentage. */
export function Ring({ percent, empty }: { percent: number; empty?: boolean }) {
  const r = 26, c = 2 * Math.PI * r;
  const color = empty ? "#cbd5e1" : percent >= 75 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(Math.max(percent, 0), 100) / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-600">{percent}%</span>
    </div>
  );
}

export function Panel({ icon, title, href, children }: { icon: ReactNode; title: string; href: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900"><span className="text-blue-600">{icon}</span>{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-1.5 text-sm font-semibold text-blue-600 hover:bg-sky-100">View all <ArrowRightIcon className="h-4 w-4" /></Link>
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-slate-50 px-4 py-9 text-center">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">{icon}</span>
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-0.5 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">{icon}</span>
      <span className="w-24 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="min-w-0 break-words text-sm font-medium text-slate-900">{children}</span>
    </div>
  );
}
