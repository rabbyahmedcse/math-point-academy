
import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EditProfile } from "@/components/features/account/EditProfileModal";
import {
  BookIcon,
  IdIcon,
  KeyIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/session";
import { getChildren } from "@/lib/parent-data";
import { connectDB } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Batch } from "@/models/Batch";

export const ROLE_BADGE: Record<string, string> = {
  admin: "border-violet-200 bg-violet-50 text-violet-700",
  teacher: "border-blue-200 bg-blue-50 text-blue-700",
  student: "border-amber-200 bg-amber-50 text-amber-700",
  parent: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function Row({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="group/row grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] items-start gap-3 border-b border-slate-100/90 py-4 text-sm transition-colors duration-200 last:border-0 hover:bg-indigo-50/30 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-center sm:px-3 sm:hover:rounded-xl">
      <span className="flex min-w-0 items-center gap-2.5 text-slate-500 transition-colors group-hover/row:text-indigo-600">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-200 group-hover/row:bg-indigo-100 group-hover/row:text-indigo-600">
          {icon}
        </span>
        <span className="leading-5">{label}</span>
      </span>

      <span className="min-w-0 break-words font-semibold leading-6 text-slate-800">
        {children}
      </span>
    </div>
  );
}

/** My Account — shared by admin, teacher, student and parent. */
export default async function AccountPage() {
  const u = await getCurrentUser();

  if (!u) redirect("/login");

  await connectDB();

  const [batch, children] = await Promise.all([
    u.role === "student" && u.batchId
      ? Batch.findById(u.batchId, { name: 1 }).lean()
      : null,
    u.role === "parent" ? getChildren(u.id) : [],
  ]);

  const base = `/dashboard/${u.role}`;

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold capitalize shadow-sm",
        ROLE_BADGE[u.role],
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current"
      />
      {u.role}
    </span>
  );

  return (
    <div className="relative isolate">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-8 top-72 -z-10 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl"
      />

      {/* Page header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 hover:-translate-y-1 hover:rotate-3 sm:h-16 sm:w-16">
            <UserIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-400"
            />
          </div>

          <div className="min-w-0 pt-0.5">
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-600 sm:text-xs">
              Account settings
            </p>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              My Account
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">
              Manage your profile and account settings.
            </p>
          </div>
        </div>

        <div className="sm:pb-1">
          <Breadcrumb
            items={[
              { label: "Home", href: base },
              { label: "My Account" },
            ]}
          />
        </div>
      </div>

      {/* Profile card */}
      <section
        className="group relative max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_60px_-35px_rgba(30,41,59,0.3)] backdrop-blur-xl transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_24px_70px_-35px_rgba(79,70,229,0.25)]"
        aria-labelledby="profile-info"
      >
        {/* Card header */}
        <div className="relative overflow-hidden border-b border-indigo-100/70 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/80 px-4 py-5 sm:px-6 sm:py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-20 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl"
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-100/80 text-indigo-600 shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3">
                <UserIcon className="h-6 w-6" />
              </span>

              <div className="min-w-0">
                <h2
                  id="profile-info"
                  className="text-base font-extrabold text-slate-900 sm:text-lg"
                >
                  Profile Information
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  View and manage your personal details.
                </p>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <EditProfile
                passwordHref={`${base}/account/password`}
                values={{
                  role: u.role,
                  name: u.name,
                  email: u.email,
                  phone: u.phone ?? "",
                  address: u.address ?? "",
                  image: u.image ?? "",
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          {/* Profile hero */}
          <div className="group/profile relative isolate overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-violet-50/80 to-sky-50/80 p-5 shadow-inner shadow-white/70 transition-all duration-300 hover:border-indigo-200 sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-white/60 blur-3xl transition-transform duration-700 group-hover/profile:scale-125"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl"
            />

            <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
              <div className="shrink-0 transition-transform duration-300 group-hover/profile:-translate-y-1">
                <Avatar
                  name={u.name}
                  image={u.image}
                  size="h-24 w-24 text-4xl ring-4 ring-white shadow-xl shadow-indigo-900/10 sm:h-28 sm:w-28"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h3 className="break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {u.name}
                  </h3>
                  {badge}
                </div>

                <p className="mt-3 flex min-w-0 items-center justify-center gap-2 text-sm text-slate-600 sm:justify-start">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/80 text-indigo-600 shadow-sm">
                    <MailIcon className="h-4 w-4" />
                  </span>
                  <span className="break-all">{u.email}</span>
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm">
                    <ShieldIcon className="h-3.5 w-3.5 text-indigo-500" />
                    Account verified by role
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-600 to-violet-600" />
              <h3 className="text-sm font-extrabold text-slate-800">
                Personal details
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white px-3 shadow-sm sm:px-4">
              <Row
                icon={<UserIcon className="h-4 w-4" />}
                label="Full Name"
              >
                {u.name}
              </Row>

              <Row
                icon={<MailIcon className="h-4 w-4" />}
                label="Email Address"
              >
                {u.email}
              </Row>

              <Row
                icon={<ShieldIcon className="h-4 w-4" />}
                label="Role"
              >
                {badge}
              </Row>

              <Row
                icon={<PhoneIcon className="h-4 w-4" />}
                label="Mobile Number"
              >
                {u.phone || "—"}
              </Row>

              <Row
                icon={<PinIcon className="h-4 w-4" />}
                label="Address"
              >
                {u.address || "—"}
              </Row>

              {u.role === "student" && (
                <>
                  <Row
                    icon={<IdIcon className="h-4 w-4" />}
                    label="Student ID"
                  >
                    <span className="font-mono text-sm">
                      {u.studentId ?? "—"}
                    </span>
                  </Row>

                  <Row
                    icon={<BookIcon className="h-4 w-4" />}
                    label="Class / Batch"
                  >
                    {u.className ?? "—"} · {batch?.name ?? "—"}
                  </Row>
                </>
              )}

              {u.role === "parent" && (
                <Row
                  icon={<UsersIcon className="h-4 w-4" />}
                  label="Linked student(s)"
                >
                  {children.length === 0 ? (
                    "—"
                  ) : (
                    <ul className="space-y-2">
                      {children.map((c) => (
                        <li
                          key={c.id}
                          className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 transition-colors hover:border-indigo-100 hover:bg-indigo-50/50"
                        >
                          <span className="font-semibold text-slate-800">
                            {c.name}
                          </span>

                          <span className="font-mono text-xs text-slate-500">
                            ({c.studentId})
                          </span>

                          <span className="text-xs font-medium capitalize text-indigo-600">
                            · {c.relationship}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Row>
              )}
            </div>
          </div>

          {/* Security panel */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/80 via-white to-indigo-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                <KeyIcon className="h-5 w-5" />
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Account security
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep your account secure by updating your password when
                  needed.
                </p>
              </div>
            </div>

            <Link
              href={`${base}/account/password`}
              className="group/password inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/50 active:translate-y-0 sm:w-auto"
            >
              <KeyIcon className="h-4 w-4 transition-transform duration-300 group-hover/password:rotate-12" />
              Change Password
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
