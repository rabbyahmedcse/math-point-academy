
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangePassword } from "./ChangePassword";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LockIcon, ShieldIcon } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/session";

/** Dedicated Change Password page — shared by admin, teacher, student and parent. */
export default async function ChangePasswordPage() {
  const u = await getCurrentUser();

  if (!u) redirect("/login");

  const base = `/dashboard/${u.role}`;
  const accountHref = `${base}/account`;

  return (
    <main className="relative isolate mx-auto w-full max-w-6xl space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-32 -z-10 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl"
      />

      {/* Page heading */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50/70 p-5 shadow-[0_16px_50px_-35px_rgba(79,70,229,0.35)] sm:p-7 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-indigo-100/40"
        />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 hover:rotate-3 hover:scale-105 sm:h-14 sm:w-14">
              <LockIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
                  Account Security
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Security Settings
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Change Password
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Update your password to help keep your Math Point Academy
                account safe and secure.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center xl:flex-col xl:items-end">
            <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldIcon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-extrabold text-slate-800">
                  Protect your account
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Choose a strong password
                </p>
              </div>
            </div>

            <Breadcrumb
              items={[
                { label: "Home", href: base },
                { label: "My Account", href: accountHref },
                { label: "Change Password" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Password form section */}
      <section
        aria-labelledby="cp-title"
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_65px_-38px_rgba(15,23,42,0.22)] transition-shadow duration-300 hover:shadow-[0_24px_75px_-38px_rgba(79,70,229,0.25)]"
      >
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-400" />

        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white via-indigo-50/30 to-violet-50/40 px-5 py-5 sm:flex-row sm:items-center sm:px-7 sm:py-6 lg:px-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 shadow-inner">
            <LockIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="cp-title"
              className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl"
            >
              Update your credentials
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Enter your current password, then choose and confirm your new
              password.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-indigo-100 bg-white/90 px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm">
            <ShieldIcon className="h-4 w-4" />
            Secure update
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <ChangePassword accountHref={accountHref} />
        </div>
      </section>

      {/* Back navigation */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm leading-6 text-slate-500">
          Need to review your profile information instead?
        </p>

        <Link
          href={accountHref}
          className="group inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:self-auto"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
            aria-hidden="true"
          >
            <path
              d="M19 12H5m7 7-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          Back to My Account
        </Link>
      </div>
    </main>
  );
}
