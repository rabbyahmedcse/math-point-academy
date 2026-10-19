import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ChangePassword } from "./ChangePassword";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BookIcon, CameraIcon, IdIcon, KeyIcon, MailIcon, PencilIcon, PhoneIcon, PinIcon, ShieldIcon, UserIcon } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Batch } from "@/models/Batch";

export const ROLE_BADGE: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700", teacher: "bg-blue-100 text-blue-700",
  student: "bg-amber-100 text-amber-700", parent: "bg-emerald-100 text-emerald-700",
};

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-center gap-3 border-b border-slate-100 py-3.5 text-sm last:border-0 sm:grid-cols-[11rem_1fr]">
      <span className="flex items-center gap-2.5 text-slate-500"><span className="text-slate-400">{icon}</span>{label}</span>
      <span className="min-w-0 break-words font-medium text-slate-900">{children}</span>
    </div>
  );
}

/** "My Account" — shared by admin, teacher, student and parent. */
export default async function AccountPage() {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  await connectDB();
  const batch = u.role === "student" && u.batchId ? await Batch.findById(u.batchId, { name: 1 }).lean() : null;
  const base = `/dashboard/${u.role}`;
  const edit = `${base}/account/edit`;
  const badge = <span className={cn("badge px-3 py-1 text-sm capitalize", ROLE_BADGE[u.role])}>{u.role}</span>;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">My Account</h1>
          <p className="mt-1 text-slate-500">Manage your profile and account settings</p>
        </div>
        <Breadcrumb items={[{ label: "Home", href: base }, { label: "My Account" }]} />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        {/* Profile information */}
        <section className="overflow-hidden surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/40 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="icon-tile bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 shadow-inner"><UserIcon className="h-6 w-6" /></span>
              <div><h2 className="font-semibold text-slate-900">Profile Information</h2><p className="text-sm text-slate-500">View your account details</p></div>
            </div>
            <Link href={edit} className="inline-flex items-center gap-2 btn btn-primary">
              <PencilIcon className="h-4 w-4" />Update Profile
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            <div className="relative flex flex-wrap items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50/70 to-sky-50 p-5 ring-1 ring-indigo-100/70">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/50 blur-2xl" />
              <div className="relative">
                <Avatar name={u.name} image={u.image} size="h-28 w-28 text-4xl ring-4 ring-white shadow-lg" />
                {u.role === "student" && (
                  <Link href={edit} aria-label="Change photo" className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-600 to-violet-600 transition hover:scale-105 text-white shadow hover:bg-indigo-700">
                    <CameraIcon className="h-4 w-4" />
                  </Link>
                )}
              </div>
              <div className="relative min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-2xl font-bold text-slate-900">{u.name}</h3>{badge}</div>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><MailIcon className="h-4 w-4 text-slate-400" />{u.email}</p>
              </div>
            </div>

            <div className="mt-5">
              <Row icon={<UserIcon className="h-5 w-5" />} label="Full Name">{u.name}</Row>
              <Row icon={<MailIcon className="h-5 w-5" />} label="Email Address">{u.email}</Row>
              <Row icon={<ShieldIcon className="h-5 w-5" />} label="Role">{badge}</Row>
              <Row icon={<PhoneIcon className="h-5 w-5" />} label="Mobile">{u.phone || "—"}</Row>
              {u.role === "student" && (
                <>
                  <Row icon={<IdIcon className="h-5 w-5" />} label="Student ID"><span className="font-mono">{u.studentId}</span></Row>
                  <Row icon={<BookIcon className="h-5 w-5" />} label="Class / Batch">{u.className} · {batch?.name ?? "—"}</Row>
                  <Row icon={<PinIcon className="h-5 w-5" />} label="Address">{u.address || "—"}</Row>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Change password */}
        <section className="overflow-hidden surface">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/40 px-5 py-4 sm:px-6">
            <span className="icon-tile bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 shadow-inner"><KeyIcon className="h-6 w-6" /></span>
            <div><h2 className="font-semibold text-slate-900">Change Password</h2><p className="text-sm text-slate-500">Keep your account secure</p></div>
          </div>
          <div className="p-5 sm:p-6"><ChangePassword /></div>
        </section>
      </div>
    </>
  );
}
