
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function HeroPage() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 -z-10 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      {/* Floating math symbols */}
      <span className="pointer-events-none absolute left-[8%] top-[15%] animate-[bounce_3s_ease-in-out_infinite] text-5xl font-bold text-indigo-300/50">
        π
      </span>

      <span className="pointer-events-none absolute right-[8%] top-[30%] animate-[pulse_2s_ease-in-out_infinite] text-4xl font-bold text-cyan-300/50">
        ƒ(x)
      </span>

      <span className="pointer-events-none absolute bottom-[15%] left-[12%] animate-[bounce_4s_ease-in-out_infinite] text-3xl text-amber-300/40">
        ∑
      </span>

      <span className="pointer-events-none absolute right-[35%] top-[12%] animate-[pulse_3s_ease-in-out_infinite] text-2xl text-purple-300/30">
        ∞
      </span>

      {/* Main content */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">

        {/* Left content */}
        <div className="relative z-10 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-300 backdrop-blur-lg">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
            Building Mathematical Excellence
          </span>

          <h1 className="mt-7 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Master the Art of
            <span className="mt-2 block bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Mathematics
            </span>
            <span className="mt-2 block">
              with Confidence.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg lg:mx-0">
            {SITE.description}
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/30"
            >
              ভর্তি / Student Register
              <span>→</span>
            </Link>

            <Link
              href="/register/parent"
              className="inline-flex items-center gap-3 rounded-xl border border-indigo-300/40 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500/20"
            >
              Parent account
              <span>↗</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              Sign in
              <span>→</span>
            </Link>
          </div>

          {/* Course highlights */}
          <div className="mt-9 flex flex-wrap justify-center gap-5 text-sm text-slate-400 lg:justify-start">
            <span>✓ Class 6–10 Mathematics</span>
            <span>✓ HSC ICT</span>
          </div>
        </div>

        {/* Right 3D card */}
        <div className="group relative mx-auto w-full max-w-lg [perspective:1200px]">

          {/* Continuously rotating orbit rings */}
          <div className="pointer-events-none absolute inset-0 scale-110 animate-[spin_18s_linear_infinite] rounded-[50%] border border-indigo-400/30" />

          <div className="pointer-events-none absolute inset-5 animate-[spin_12s_linear_infinite_reverse] rounded-[50%] border border-amber-300/25" />

          {/* Extra decorative orbit */}
          <div className="pointer-events-none absolute inset-10 animate-[spin_25s_linear_infinite] rounded-[50%] border border-cyan-300/10" />

          {/* Main floating glass card */}
          <div className="relative flex aspect-[4/3] flex-col items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-white/15 via-indigo-500/10 to-slate-950/80 p-6 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl animate-[bounce_5s_ease-in-out_infinite] transition-all duration-500 group-hover:[transform:rotateY(0deg)_rotateX(0deg)_scale(1.02)] [transform:rotateY(-5deg)_rotateX(3deg)] sm:p-10 motion-reduce:animate-none">

            {/* Logo */}
            <div className="rounded-3xl border border-white/10 bg-indigo-400/10 p-4 shadow-xl shadow-indigo-500/20 transition-transform duration-500 group-hover:scale-105">
              <img
                src="/logo-mark.png"
                alt={`${SITE.name} logo`}
                className="h-24 w-24 rounded-2xl object-contain sm:h-32 sm:w-32"
              />
            </div>

            {/* Academy name */}
            <h2 className="mt-6 text-center text-2xl font-extrabold sm:text-3xl">
              <span className="bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                {SITE.name}
              </span>
            </h2>

            <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-amber-300 to-indigo-400" />

            <p className="mt-4 text-center text-sm text-slate-300 sm:text-base">
              Learn • Practice • Excel
            </p>

            {/* Floating mathematics card */}
            <div className="absolute -left-3 top-[15%] flex animate-[bounce_4s_ease-in-out_infinite] flex-col items-center rounded-2xl border border-white/20 bg-slate-900/90 p-3 shadow-xl transition-transform duration-500 group-hover:-translate-y-2 sm:-left-6">
              <span className="text-2xl text-amber-300">π</span>
              <span className="text-xs text-slate-300">
                Mathematics
              </span>
            </div>

            {/* Floating problem-solving card */}
            <div className="absolute -bottom-3 -right-3 flex animate-[bounce_3.5s_ease-in-out_infinite] flex-col items-center rounded-2xl border border-white/20 bg-slate-900/90 p-3 shadow-xl transition-transform duration-500 group-hover:translate-y-2 sm:-right-6">
              <span className="text-2xl text-cyan-300">ƒ(x)</span>
              <span className="text-xs text-slate-300">
                Problem Solving
              </span>
            </div>
          </div>

          {/* Platform glow */}
          <div className="mx-auto -mt-1 h-8 w-3/4 rounded-[50%] bg-gradient-to-r from-indigo-500/30 via-amber-300/40 to-cyan-400/30 blur-xl transition-all duration-500 group-hover:w-4/5" />

          <p className="mt-6 text-center text-sm text-slate-400">
            Building strong foundations for a brighter future.
          </p>
        </div>
      </div>
    </section>
  );
}
