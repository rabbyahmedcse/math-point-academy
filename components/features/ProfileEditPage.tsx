import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getCurrentUser } from "@/lib/session";

/** "Update Profile" — opens from the My Account page. */
export default async function ProfileEditPage() {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  const base = `/dashboard/${u.role}`;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Update Profile</h1>
          <p className="mt-1 text-slate-500">{u.role === "student" ? "Change your photo link and contact details" : "Change your contact details"}</p>
        </div>
        <Breadcrumb items={[{ label: "Home", href: base }, { label: "My Account", href: `${base}/account` }, { label: "Update Profile" }]} />
      </div>
      <section className="surface max-w-3xl p-5 sm:p-7">
        <ProfileForm role={u.role} name={u.name} email={u.email} phone={u.phone} address={u.address} image={u.image} />
      </section>
      <Link href={`${base}/account`} className="mt-4 inline-block text-sm text-indigo-600 hover:underline">← Back to My Account</Link>
    </>
  );
}
