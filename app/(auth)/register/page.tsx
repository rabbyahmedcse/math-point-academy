import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-violet-300/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-10 left-1/4 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="card relative w-full border-white/60 bg-white/80 shadow-[var(--shadow-lift)] backdrop-blur-xl max-w-2xl sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link href={'/'}><img src="/logo-mark.png" alt="" className="mb-3 h-14 w-14 rounded-xl shadow-lg ring-4 ring-white" /></Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text">Student registration</h1>
        <p className="mb-5 mt-1 text-sm text-slate-500">Your unique Student ID is generated automatically after you submit.</p>
        <RegisterForm />
      </div>
    </main>
  );
}
