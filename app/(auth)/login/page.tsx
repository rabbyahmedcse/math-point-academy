
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import Navbar from "@/app/Navbar";
import Footer from "@/app/footer";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(`/dashboard/${user.role}`);
  }

  await connectDB();

  const settings = await Settings.findById("main").lean();
  const coachingName = settings?.coachingName ?? SITE.name;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f6ff] text-slate-900">
      {/* Navbar */}
      <div className="relative z-50">
        <Navbar name={coachingName} dash={null} />
      </div>

      {/* Animated Background */}
      <main className="relative isolate flex min-h-[78vh] items-center justify-center overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
        {/* Background glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-400/25 blur-[100px] sm:h-[30rem] sm:w-[30rem]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-violet-400/25 blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-sky-300/25 blur-[100px]"
        />

        {/* Floating Math Symbols */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        >
          <span className="absolute left-[8%] top-[16%] animate-[float_7s_ease-in-out_infinite] text-4xl font-black text-indigo-500/15 sm:text-6xl">
            ∑
          </span>

          <span className="absolute right-[12%] top-[18%] animate-[float_8s_ease-in-out_infinite_1s] text-5xl font-black text-violet-500/15 sm:text-7xl">
            π
          </span>

          <span className="absolute bottom-[18%] left-[12%] animate-[float_9s_ease-in-out_infinite_2s] text-4xl font-black text-sky-600/15 sm:text-6xl">
            √x
          </span>

          <span className="absolute bottom-[16%] right-[10%] animate-[float_7s_ease-in-out_infinite_1s] text-4xl font-black text-indigo-500/15 sm:text-6xl">
            ∞
          </span>

          <span className="absolute left-[24%] top-[45%] hidden animate-pulse text-2xl text-violet-500/20 sm:block">
            +
          </span>

          <span className="absolute right-[25%] top-[55%] hidden animate-pulse text-3xl text-indigo-500/20 sm:block">
            ×
          </span>
        </div>

        {/* Decorative orbit rings */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[35rem] w-[35rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-400/10 animate-[spin_35s_linear_infinite] lg:block"
        >
          <div className="absolute left-10 top-16 h-3 w-3 rounded-full bg-indigo-400/40 shadow-lg shadow-indigo-400/30" />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/10 animate-[spin_25s_linear_infinite_reverse] lg:block"
        >
          <div className="absolute bottom-12 right-12 h-2.5 w-2.5 rounded-full bg-violet-400/50" />
        </div>

        {/* Login Card Wrapper */}
        <div className="relative z-10 w-full max-w-[440px] [perspective:1200px]">
          {/* Card glow */}
          <div
            aria-hidden="true"
            className="absolute -inset-1 animate-pulse rounded-[2rem] bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-sky-400/30 opacity-70 blur-xl"
          />

          {/* 3D Login Card */}
          <section className="relative rounded-[1.7rem] border border-white/80 bg-white/75 p-6 shadow-[0_25px_80px_-20px_rgba(79,70,229,0.25)] backdrop-blur-2xl transition-transform duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(1deg)_rotateY(-1deg)] sm:rounded-[2rem] sm:p-9">
            {/* Top gradient line */}
            <div
              aria-hidden="true"
              className="absolute left-8 right-8 top-0 h-[3px] rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400"
            />

            {/* Academy Logo */}
            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
              <div
                aria-hidden="true"
                className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-[1.7rem] border-2 border-dashed border-indigo-300/60"
              />

              <div className="relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl border border-white bg-white p-1 shadow-[0_10px_30px_-8px_rgba(79,70,229,0.35)] sm:h-20 sm:w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-mark.png"
                  alt={`${coachingName} logo`}
                  width={80}
                  height={80}
                  className="h-full w-full rounded-xl object-contain"
                />
              </div>

              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-ping rounded-full bg-emerald-400/70"
              />

              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
              />
            </div>

            {/* Heading */}
            <div className="mb-7 text-center">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">
                Welcome Back
              </p>

              <h1 className="break-words bg-gradient-to-r from-indigo-700 via-violet-600 to-indigo-700 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
                {coachingName}
              </h1>

              <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
                Sign in to continue your learning journey.
              </p>
            </div>

            {/* Login Form */}
            <div className="relative">
              <LoginForm />
            </div>

            {/* Bottom decoration */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-300" />

              <span className="text-[10px] font-semibold tracking-wide text-slate-400">
                LEARN • PRACTICE • EXCEL
              </span>

              <span className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-300" />
            </div>
          </section>

          {/* Card shadow base */}
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-4 w-[82%] rounded-[50%] bg-indigo-900/10 blur-xl"
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
