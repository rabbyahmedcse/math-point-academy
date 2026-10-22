
"use client";

import { useState } from "react";
import Link from "next/link";

type NavbarProps = {
  name: string;
  dash: string | null;
};

const navLinks = [
  { href: "#about", label: "আমাদের সম্পর্কে" },
  { href: "#specialities", label: "বৈশিষ্ট্য" },
  { href: "#portal", label: "Student Portal" },
  { href: "#contact", label: "যোগাযোগ" },
];

export default function Navbar({ name, dash }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white shadow-lg shadow-slate-950/10 backdrop-blur-xl">
      {/* Navbar main row */}
      <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo and Academy Name */}
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
          aria-label={`${name} Home`}
        >
          <div className="shrink-0 rounded-xl border border-amber-300/20 bg-white/10 p-1.5 transition-all duration-300 group-hover:border-amber-300/50 group-hover:bg-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt={`${name} logo`}
              width={40}
              height={40}
              className="h-8 w-8 rounded-lg object-contain sm:h-10 sm:w-10"
            />
          </div>

          <span className="max-w-[150px] truncate text-sm font-extrabold tracking-tight text-white transition-colors group-hover:text-amber-300 sm:max-w-xs sm:text-lg">
            {name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-amber-300"
            >
              {item.label}
            </a>
          ))}

          {dash ? (
            <Link
              href={dash}
              className="ml-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="ml-2 whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:border-amber-300/40 hover:bg-white/10"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20"
              >
                Register →
              </Link>
            </>
          )}
        </nav>

        {/* Mobile and Tablet Actions */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          {dash ? (
            <Link
              href={dash}
              onClick={closeMenu}
              className="whitespace-nowrap rounded-lg bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:brightness-105 sm:text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              className="whitespace-nowrap rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((previous) => !previous)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition hover:border-amber-300/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile and Tablet Menu: overlay, not part of document flow */}
      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={`absolute inset-x-0 top-full z-50 border-t border-white/10 bg-slate-950 px-4 shadow-[0_24px_50px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out sm:px-6 lg:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <nav
          aria-label="Mobile navigation"
          className="mx-auto flex max-w-7xl flex-col gap-1 py-3"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              {item.label}
            </a>
          ))}

          {!dash && (
            <Link
              href="/register"
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              className="mt-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-3 text-center text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition hover:brightness-105"
            >
              Student Register →
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
