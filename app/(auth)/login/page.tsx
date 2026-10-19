import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(`/dashboard/${user.role}`);
  await connectDB();
  const s = await Settings.findById("main").lean();
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-violet-300/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-10 left-1/4 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="card relative w-full border-white/60 bg-white/80 shadow-[var(--shadow-lift)] backdrop-blur-xl max-w-md sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" className="mx-auto mb-3 h-20 w-20 rounded-2xl shadow-lg ring-4 ring-white" />
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text">{s?.coachingName ?? SITE.name}</h1>
        <p className="mb-6 mt-1 text-center text-sm text-slate-500">Sign in — Admin, Teacher or Student</p>
        <LoginForm />
      </div>
    </main>
  );
}
