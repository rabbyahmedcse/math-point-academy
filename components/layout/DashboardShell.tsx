"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import {
  BellIcon, BookOpenIcon, CalendarCheckIcon, CalendarIcon, CardIcon, ChartIcon, ChevronDownIcon, ClipboardIcon, GraduationIcon,
  HomeIcon, LayersIcon, LogOutIcon, SlidersIcon, UserIcon, UsersIcon,
} from "@/components/ui/icons";

const ICONS = {
  home: HomeIcon, user: UserIcon, users: UsersIcon, graduation: GraduationIcon, layers: LayersIcon, calendar: CalendarIcon,
  calendarCheck: CalendarCheckIcon, clipboard: ClipboardIcon, card: CardIcon, bell: BellIcon, book: BookOpenIcon, chart: ChartIcon, sliders: SlidersIcon,
} as const;
export type IconKey = keyof typeof ICONS;
export interface NavItem { href: string; label: string; icon?: IconKey }

const PORTAL: Record<string, string> = { admin: "Admin Panel", teacher: "Teacher Portal", student: "Student Portal", parent: "Parent Portal" };

export function DashboardShell({ user, nav, brand, bell, children }: {
  user: { name: string; role: string; studentId?: string; image?: string; mustChangePassword: boolean };
  nav: NavItem[];
  brand: string;
  bell: { href: string; dot: boolean };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const base = `/dashboard/${user.role}`;

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* ---------- Sidebar (drawer on mobile) ---------- */}
      <aside className={cn("no-print fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-slate-200/70 bg-white/85 backdrop-blur-xl transition duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center gap-3 px-6 py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
         <Link href={'/'}> <img src="/logo-mark.png" alt="" className="h-11 w-11 shrink-0 rounded-xl shadow-md ring-1 ring-slate-900/5" /></Link>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold leading-tight tracking-tight text-slate-900">{brand}</p>
            <p className="mt-0.5 text-xs font-medium text-indigo-600/80">{PORTAL[user.role] ?? "Portal"}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
          {nav.map((n) => {
            const Icon = n.icon ? ICONS[n.icon] : HomeIcon;
            const active = n.href === base ? pathname === base : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
                className={cn("group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14.5px] font-medium transition-all duration-200", active ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100" : "text-slate-600 hover:translate-x-0.5 hover:bg-slate-100/80 hover:text-slate-900")}>
                {active && <span aria-hidden className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500" />}
                <Icon className={cn("h-5 w-5 shrink-0 transition", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />{n.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[14.5px] font-medium text-rose-600 transition hover:bg-rose-50">
            <LogOutIcon className="h-5 w-5" />Logout
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 animate-fade-in bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* ---------- Top bar + content ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/75 px-4 backdrop-blur-xl sm:px-8">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden">☰</button>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href={bell.href} aria-label="Notices" className="relative rounded-full p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600">
              <BellIcon className="h-6 w-6" />
              {bell.dot && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500"><span className="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-60" /></span>}
            </Link>
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 ring-1 ring-transparent transition hover:bg-white hover:ring-slate-200 [&::-webkit-details-marker]:hidden">
                <Avatar name={user.name} image={user.image} size="h-9 w-9 text-sm ring-2 ring-white shadow" />
                <span className="hidden max-w-32 truncate font-semibold text-slate-800 sm:block">{user.name}</span>
                <ChevronDownIcon className="h-4 w-4 text-slate-500" />
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 py-1.5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
                <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
                  <p className="font-semibold capitalize text-slate-700">{user.role}</p>
                  {user.studentId && <p className="font-mono">{user.studentId}</p>}
                </div>
                <Link href={`${base}/account`} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">My account</Link>
                <button onClick={signOut} className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
              </div>
            </details>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-[1400px] flex-1 animate-fade-in p-4 sm:p-6 lg:p-8">
          {user.mustChangePassword && (
            <div className="no-print mb-5 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
              You are using a temporary password. <Link className="font-semibold underline" href={`${base}/account`}>Change it now</Link>.
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
