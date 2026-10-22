
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/layout/NotificationBell";

import {
  BellIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CardIcon,
  ChartIcon,
  ChevronDownIcon,
  ClipboardIcon,
  GraduationIcon,
  HomeIcon,
  LayersIcon,
  LogOutIcon,
  SlidersIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";

const ICONS = {
  home: HomeIcon,
  user: UserIcon,
  users: UsersIcon,
  graduation: GraduationIcon,
  layers: LayersIcon,
  calendar: CalendarIcon,
  calendarCheck: CalendarCheckIcon,
  clipboard: ClipboardIcon,
  card: CardIcon,
  bell: BellIcon,
  book: BookOpenIcon,
  chart: ChartIcon,
  sliders: SlidersIcon,
} as const;

export type IconKey = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon?: IconKey;
}

const PORTAL: Record<string, string> = {
  admin: "Admin Panel",
  teacher: "Teacher Portal",
  student: "Student Portal",
  parent: "Parent Portal",
};

type DashboardUser = {
  name: string;
  email?: string;
  role: string;
  studentId?: string;
  image?: string;
  mustChangePassword: boolean;
};

export function DashboardShell({
  user,
  nav,
  brand,
  bell,
  children,
}: {
  user: DashboardUser;
  nav: NavItem[];
  brand: string;
  bell: { href: string; dot: boolean };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  const base = `/dashboard/${user.role}`;

  async function signOut() {
    setProfileOpen(false);
    setOpen(false);

    await authClient.signOut();

    router.push("/login");
    router.refresh();
  }

  // Close menus after navigation.
  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close profile dropdown on outside click or Escape.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 text-slate-800 lg:flex">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-indigo-300/10 blur-3xl" />
        <div className="absolute -right-32 top-60 h-80 w-80 rounded-full bg-violet-300/10 blur-3xl" />
      </div>

      {/* Mobile sidebar backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col",
          "border-r border-white/70 bg-white/90 shadow-[8px_0_40px_rgba(49,46,129,0.08)] backdrop-blur-2xl",
          "transition-transform duration-300 ease-out",
          "lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="relative overflow-hidden border-b border-indigo-100/70 px-5 py-5 sm:px-6 sm:py-6">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-violet-300/20 blur-2xl"
          />

          <Link
            href={base}
            onClick={() => setOpen(false)}
            className="group relative flex min-w-0 items-center gap-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt=""
              className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-[0_8px_18px_rgba(79,70,229,0.20)] ring-1 ring-indigo-100 transition duration-300 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:shadow-[0_14px_24px_rgba(79,70,229,0.28)] sm:h-12 sm:w-12"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-extrabold tracking-tight text-slate-900 sm:text-base">
                {brand}
              </p>
              <p className="mt-1 text-xs font-semibold text-indigo-600">
                {PORTAL[user.role] ?? "Portal"}
              </p>
            </div>

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-100/70" />
          </Link>
        </div>

        {/* Navigation */}
        <div className="px-5 pb-2 pt-5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 pb-5 sm:px-4">
          {nav.map((item, index) => {
            const Icon = item.icon ? ICONS[item.icon] : HomeIcon;

            const active =
              item.href === base
                ? pathname === base
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                style={{ animationDelay: `${index * 35}ms` }}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-2xl",
                  "px-4 py-3 text-[13px] font-semibold sm:text-sm",
                  "transition-all duration-300 ease-out",
                  "motion-safe:animate-[fadeIn_0.35s_ease-out_both]",
                  active
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)] ring-1 ring-indigo-500/20"
                    : "text-slate-600 hover:translate-x-1 hover:bg-white hover:text-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.08)]",
                )}
              >
                {/* Shine animation */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                )}

                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-white/80"
                  />
                )}

                <span
                  className={cn(
                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                    active
                      ? "bg-white/15 text-white shadow-inner"
                      : "bg-slate-100/80 text-slate-500 group-hover:rotate-[-4deg] group-hover:bg-indigo-100 group-hover:text-indigo-600",
                  )}
                >
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </span>

                <span className="relative min-w-0 flex-1 truncate">
                  {item.label}
                </span>

                {active && (
                  <span className="relative h-1.5 w-1.5 shrink-0 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar bottom card */}
        <div className="px-4 pb-4">
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 shadow-[0_8px_24px_rgba(79,70,229,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(79,70,229,0.12)]">
            <div
              aria-hidden="true"
              className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-violet-200/40 blur-xl"
            />

            <div className="relative flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
                <GraduationIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  Math Point Academy
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Learn. Practice. Succeed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-slate-200/70 p-4">
          <button
            type="button"
            onClick={signOut}
            className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-rose-100 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600 hover:shadow-[0_6px_18px_rgba(244,63,94,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 transition-all duration-300 group-hover:rotate-[-6deg] group-hover:bg-rose-100">
              <LogOutIcon className="h-5 w-5" />
            </span>
            <span>Logout</span>
            <span className="ml-auto text-lg opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              →
            </span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/70 bg-white/75 px-3 shadow-[0_4px_24px_rgba(15,23,42,0.03)] backdrop-blur-2xl sm:px-5 md:px-8">
          {/* Left side */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
              onClick={() => setOpen((previous) => !previous)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
            >
              {open ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            <div className="min-w-0 lg:hidden">
              <p className="truncate text-xs font-extrabold text-slate-800 sm:text-sm">
                {brand}
              </p>
              <p className="truncate text-[10px] font-medium text-indigo-600 sm:text-xs">
                {PORTAL[user.role] ?? "Portal"}
              </p>
            </div>

            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-medium text-slate-400">
                {PORTAL[user.role] ?? "Portal"}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                Welcome back, {user.name.split(" ")[0]}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <NotificationBell href={bell.href} />

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => setProfileOpen((previous) => !previous)}
                className={cn(
                  "group flex items-center gap-2 rounded-full border border-transparent p-1 pr-1.5 sm:gap-2.5 sm:pr-3",
                  "transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-white hover:shadow-[0_8px_22px_rgba(79,70,229,0.12)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  profileOpen && "border-indigo-100 bg-white shadow-md",
                )}
              >
                <span className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 p-[2px] shadow-md shadow-indigo-500/20 transition-transform duration-300 group-hover:rotate-3">
                  <Avatar
                    name={user.name}
                    image={user.image}
                    size="h-8 w-8 text-xs ring-2 ring-white sm:h-9 sm:w-9 sm:text-sm"
                  />
                </span>

                <span className="hidden max-w-32 text-left sm:block">
                  <span className="block truncate text-xs font-bold text-slate-800 md:text-sm">
                    {user.name}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-medium capitalize text-indigo-500">
                    {user.role}
                  </span>
                </span>

                <ChevronDownIcon
                  className={cn(
                    "hidden h-4 w-4 text-slate-400 transition-transform duration-300 sm:block",
                    profileOpen && "rotate-180 text-indigo-600",
                  )}
                />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  aria-label="Profile menu"
                  className="absolute right-0 top-full z-[60] mt-3 w-[min(21rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_20px_60px_rgba(49,46,129,0.20)] backdrop-blur-2xl motion-safe:animate-[profileEnter_0.22s_ease-out_both]"
                >
                  {/* Profile header */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-4 py-5 text-white sm:px-5">
                    <div
                      aria-hidden="true"
                      className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl"
                    />

                    <div className="relative flex items-center gap-3">
                      <div className="rounded-2xl bg-white/15 p-1.5 shadow-inner ring-1 ring-white/20">
                        <Avatar
                          name={user.name}
                          image={user.image}
                          size="h-12 w-12 text-base ring-2 ring-white/70 sm:h-14 sm:w-14 sm:text-lg"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold sm:text-lg">
                          {user.name}
                        </p>

                        {user.email ? (
                          <p className="mt-1 truncate text-xs text-indigo-100 sm:text-sm">
                            {user.email}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs capitalize text-indigo-100">
                            {user.role}
                          </p>
                        )}

                        {user.studentId && (
                          <p className="mt-1.5 truncate font-mono text-[10px] text-indigo-100 sm:text-xs">
                            ID: {user.studentId}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="relative mt-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
                      <span className="text-[10px] font-medium text-indigo-100 sm:text-xs">
                        Signed in to your portal
                      </span>
                    </div>
                  </div>

                  {/* Profile link */}
                  <Link
                    href={`${base}/account`}
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="group flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 transition-colors duration-200 hover:bg-indigo-50/80 sm:px-5 sm:py-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-all duration-300 group-hover:rotate-[-5deg] group-hover:bg-indigo-100 group-hover:shadow-sm">
                      <UserIcon className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">
                        প্রোফাইল দেখুন
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Account information and details
                      </span>
                    </span>

                    <span className="text-lg text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-indigo-600">
                      →
                    </span>
                  </Link>

                  {/* Logout */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-rose-50 sm:px-5 sm:py-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-all duration-300 group-hover:rotate-[-5deg] group-hover:bg-rose-100">
                      <LogOutIcon className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-rose-600">
                        সাইন আউট
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Logout from your account
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full min-w-0 max-w-[1500px] flex-1 p-3 sm:p-5 md:p-6 lg:p-8">
          {user.mustChangePassword && (
            <div className="no-print mb-5 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-4 py-3.5 text-sm text-amber-900 shadow-[0_8px_24px_rgba(245,158,11,0.08)]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                !
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-bold">Security reminder</p>
                <p className="mt-1 text-xs leading-5 text-amber-800 sm:text-sm">
                  You are using a temporary password. Please change it to
                  secure your account.
                </p>

                <Link
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-800 underline underline-offset-4 hover:text-amber-950 sm:text-sm"
                  href={`${base}/account/password`}
                >
                  Change password now →
                </Link>
              </div>
            </div>
          )}

          <div className="min-w-0 motion-safe:animate-[contentEnter_0.4s_ease-out_both]">
            {children}
          </div>
        </main>

        {/* Footer spacing */}
        <div className="h-3 shrink-0 sm:h-5" />
      </div>

      {/* Local animations; no extra CSS file required */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes profileEnter {
          from {
            opacity: 0;
            transform: perspective(800px) rotateX(-8deg) translateY(-8px)
              scale(0.98);
          }
          to {
            opacity: 1;
            transform: perspective(800px) rotateX(0) translateY(0) scale(1);
          }
        }

        @keyframes contentEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
