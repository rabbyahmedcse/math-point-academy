
import { RegisterForm } from "@/components/auth/RegisterForm";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import Navbar from "@/app/Navbar";
import Footer from "@/app/footer";

export default async function RegisterPage() {
  await connectDB();

  const settings = await Settings.findById("main").lean();
  const coachingName = settings?.coachingName ?? SITE.name;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f6ff] text-slate-900">
      {/* Navbar */}
      <div className="relative z-50">
        <Navbar name={coachingName} dash={null} />
      </div>

      {/* Registration Section */}
      <main className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        {/* Background Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 animate-pulse rounded-full bg-indigo-400/25 blur-[100px] sm:h-[30rem] sm:w-[30rem]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 animate-pulse rounded-full bg-violet-400/25 blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 animate-pulse rounded-full bg-sky-300/25 blur-[100px]"
        />

        {/* Floating Mathematical Symbols */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        >
          <span className="absolute left-[6%] top-[12%] animate-bounce text-5xl font-black text-indigo-500/15 [animation-duration:7s] sm:text-7xl">
            ∑
          </span>

          <span className="absolute right-[8%] top-[16%] animate-bounce text-5xl font-black text-violet-500/15 [animation-duration:8s] sm:text-7xl">
            π
          </span>

          <span className="absolute bottom-[18%] left-[7%] animate-pulse text-4xl font-black text-sky-600/15 [animation-duration:5s] sm:text-6xl">
            √x
          </span>

          <span className="absolute bottom-[14%] right-[8%] animate-bounce text-5xl font-black text-indigo-500/15 [animation-duration:9s] sm:text-7xl">
            ∞
          </span>

          <span className="absolute left-[22%] top-[42%] hidden animate-pulse text-3xl text-violet-500/20 sm:block">
            +
          </span>

          <span className="absolute right-[22%] top-[56%] hidden animate-pulse text-3xl text-indigo-500/20 sm:block">
            ×
          </span>
        </div>

        {/* Outer Orbit Ring */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full border border-indigo-400/10 xl:block"
        >
          <span className="absolute left-16 top-20 h-3 w-3 rounded-full bg-indigo-400/50 shadow-lg shadow-indigo-400/30" />
        </div>

        {/* Inner Orbit Ring */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[35rem] w-[35rem] -translate-x-1/2 -translate-y-1/2 animate-[spin_30s_linear_infinite_reverse] rounded-full border border-violet-400/10 xl:block"
        >
          <span className="absolute bottom-12 right-16 h-2.5 w-2.5 rounded-full bg-violet-400/50" />
        </div>

        {/* Registration Card Wrapper */}
        <div className="relative z-10 mx-auto w-full max-w-3xl [perspective:1400px]">
          {/* Animated Card Glow */}
          <div
            aria-hidden="true"
            className="absolute -inset-1 animate-pulse rounded-[2rem] bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-sky-400/30 opacity-70 blur-xl"
          />

          {/* 3D Registration Card */}
          <section className="relative rounded-[1.7rem] border border-white/80 bg-white/80 p-5 shadow-[0_25px_80px_-20px_rgba(79,70,229,0.25)] backdrop-blur-2xl transition-all duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(0.5deg)_rotateY(-0.5deg)] sm:rounded-[2rem] sm:p-8 md:p-10">
            {/* Top Gradient Line */}
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

            {/* Registration Heading */}
            <div className="mb-8 text-center">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">
                Join Our Academy
              </p>

              <h1 className="break-words bg-gradient-to-r from-indigo-700 via-violet-600 to-indigo-700 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl md:text-4xl">
                Student Registration
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-slate-500 sm:text-sm">
                Create your student account and start your learning journey
                with {coachingName}.
              </p>

              {/* Student ID Information */}
              <div className="mx-auto mt-5 flex max-w-xl items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 text-left transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3 19 6.5V12c0 4.5-3 7.2-7 9-4-1.8-7-4.5-7-9V6.5L12 3Z"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-bold text-indigo-950">
                    Automatic Student ID
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-800/75 sm:text-sm">
                    Your unique Student ID will be generated automatically
                    after successful registration.
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Registration Form */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
              <RegisterForm />
            </div>

            {/* Bottom Decoration */}
            <div className="mt-7 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-300" />

              <span className="text-center text-[9px] font-semibold tracking-[0.16em] text-slate-400 sm:text-[10px] sm:tracking-[0.2em]">
                LEARN • PRACTICE • EXCEL
              </span>

              <span className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-300" />
            </div>
          </section>

          {/* Card Shadow */}
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
