import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import { MailIcon, PhoneIcon, PinIcon, UserIcon, BookIcon } from "@/components/ui/icons";
import Footer from "./footer";
import HeroPage from "./hero";
import Navbar from "./Navbar";


/** Public landing page. Must still render if the database is slow or down, so DB reads are time-boxed. */
async function safe<T>(fn: () => Promise<T>, fallback: T, ms = 2500): Promise<T> {
  try {
    return await Promise.race([fn(), new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);
  } catch {
    return fallback;
  }
}

const STEPS = [
  { t: "Register online", d: "Fill in the student registration form with your own and your guardian's details." },
  { t: "Get your Student ID", d: "A unique ID like STU-2026-0001 is generated instantly. Write it down — you will sign in with it." },
  { t: "Wait for approval", d: "A teacher or the admin reviews your request and assigns you to a batch. You cannot sign in before this." },
  { t: "Start learning", d: "Sign in to see your routine, attendance, results, fees, materials and notices." },
];

const NOTES = [
  "Sign in with your Student ID or your registered email — the same login page is used by students, parents, teachers and the admin.",
  "A new registration stays Pending until it is approved. If it is rejected, contact the coaching center.",
  "Parents: register at “Parent account” with your child's Student ID and the mobile number given at admission. Children registered with that number are linked automatically.",
  "Forgot your password? Ask the admin to reset it — you will be asked to set a new one at your next sign-in.",
  "Use a password created only for this system. Never share it, and never use your email or social-media password.",
  "Students and parents can view records but cannot change attendance, marks, routine or fee records.",
];

export default async function Home() {
  const [user, settings] = await Promise.all([
    safe(() => getCurrentUser(), null),
    safe(async () => { await connectDB(); return Settings.findById("main").lean(); }, null),
  ]);
  const name = settings?.coachingName || SITE.name;
  const address = settings?.address || SITE.address;
  const phones = settings?.phone ? [{ number: settings.phone, note: "" }] : SITE.phones;
  const facebook = settings?.facebookUrl || SITE.facebook;
  const waNumber = SITE.phones[0].number.replace(/^0/, "880");
  const dash = user ? `/dashboard/${user.role}` : null;

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- Header ---------- */}
      

<Navbar name={name} dash={dash} />


      {/* ---------- Hero ---------- */}
   <HeroPage />

      {/* ---------- About us ---------- */}
     
<section
  id="about"
  className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-amber-50/40 to-white px-4 py-16 sm:py-20 lg:py-24"
>
  {/* Background decoration */}
  <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
  <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-indigo-300/10 blur-3xl" />

  <div className="relative mx-auto max-w-6xl">
    {/* Section heading */}
    <div className="text-center">
      <SectionTitle bn="আমাদের সম্পর্কে" en="About Us" />

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
        Math Point Academy-তে আমরা সহজবোধ্য পাঠদান, নিয়মিত অনুশীলন
        এবং শিক্ষার্থীদের আত্মবিশ্বাস গড়ে তোলার ওপর গুরুত্ব দিই।
      </p>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-500" />
    </div>

    {/* About cards */}
    <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-2">
      {SITE.about.map((a, index) => (
        <article
          key={a.title}
          className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/5 sm:p-8"
        >
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-500 transition-transform duration-300 group-hover:scale-x-100" />

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-200/20 blur-2xl transition-colors duration-300 group-hover:bg-amber-300/30" />

          <div className="relative">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-100 text-3xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span aria-hidden="true">{a.icon}</span>
            </div>

            {/* Card content */}
            <h3 className="mt-5 text-lg font-bold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-amber-700 sm:text-xl">
              {a.title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {a.text}
            </p>

            {/* Bottom accent */}
            <div className="mt-5 h-0.5 w-10 rounded-full bg-amber-300 transition-all duration-300 group-hover:w-20 group-hover:bg-indigo-400" />
          </div>
        </article>
      ))}
    </div>
  </div>
</section>


      {/* ---------- Specialities ---------- */}
     
<section
  id="specialities"
  className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-slate-50 px-4 py-16 sm:py-20 lg:py-24"
>
  {/* Background glow */}
  <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
  <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

  <div className="relative mx-auto max-w-6xl">
    {/* Section heading */}
    <div className="text-center">
      <SectionTitle
        bn="প্রধান বৈশিষ্ট্যসমূহ"
        en="Our Specialities"
      />

      <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-700 sm:text-lg">
        {SITE.specialitiesTitle}
      </p>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-amber-400 via-indigo-400 to-cyan-400" />
    </div>

    {/* Specialities cards */}
    <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
      {SITE.specialities.map((s, index) => (
        <article
          key={s.title}
          className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-amber-300/80 hover:shadow-xl hover:shadow-indigo-950/10 sm:p-7"
        >
          {/* Top gradient border */}
          <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-300 via-indigo-400 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100" />

          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl transition-colors duration-300 group-hover:bg-amber-300/20" />

          <div className="relative">
            {/* Icon and number */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-900 to-indigo-950 text-2xl text-white shadow-md shadow-indigo-950/15 transition-all duration-300 group-hover:scale-110 group-hover:border-amber-300/40 group-hover:shadow-lg group-hover:shadow-indigo-950/20">
                <span aria-hidden="true">{s.icon}</span>
              </div>

              <span className="text-sm font-bold tracking-widest text-indigo-200 transition-colors duration-300 group-hover:text-amber-400">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-5 text-lg font-bold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-indigo-700 sm:text-xl">
              {s.title}
            </h3>

            {/* Description */}
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {s.text}
            </p>

            {/* Bottom accent */}
            <div className="mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r from-amber-400 to-indigo-400 transition-all duration-300 group-hover:w-20" />
          </div>
        </article>
      ))}
    </div>
  </div>
</section>


      {/* ---------- Student portal ---------- */}
     
{/* ---------- Student Portal ---------- */}
<section
  id="portal"
  className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-slate-50 px-4 py-16 sm:py-20 lg:py-24"
>
  {/* Background decoration */}
  <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
  <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

  <div className="relative mx-auto max-w-6xl">
    {/* Section heading */}
    <div className="text-center">
      <SectionTitle
        bn="অনলাইন স্টুডেন্ট পোর্টাল"
        en="How to Join"
      />

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
        সহজ কয়েকটি ধাপ অনুসরণ করে Math Point Academy-এর অনলাইন
        স্টুডেন্ট পোর্টালে যুক্ত হও এবং তোমার পড়াশোনার কার্যক্রম পরিচালনা করো।
      </p>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-amber-400 via-indigo-400 to-cyan-400" />
    </div>

    {/* Joining steps */}
    <ol className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <li
          key={s.t}
          className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300/80 hover:shadow-xl hover:shadow-indigo-950/10 sm:p-6"
        >
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-300 via-indigo-400 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100" />

          {/* Step number */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-base font-extrabold text-slate-950 shadow-md shadow-amber-500/15 transition-transform duration-300 group-hover:scale-110">
              {String(i + 1).padStart(2, "0")}
            </span>

            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200 transition-colors duration-300 group-hover:text-amber-400">
              Step {i + 1}
            </span>
          </div>

          {/* Step content */}
          <h3 className="mt-5 break-words text-base font-bold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-indigo-700 sm:text-lg">
            {s.t}
          </h3>

          <p className="mt-2 break-words text-sm leading-7 text-slate-600">
            {s.d}
          </p>

          {/* Bottom accent */}
          <div className="mt-5 h-0.5 w-9 rounded-full bg-gradient-to-r from-amber-400 to-indigo-400 transition-all duration-300 group-hover:w-16" />
        </li>
      ))}
    </ol>

  
{/* Important Information */}
<div className="relative mt-14 border-t border-indigo-100 pt-10 sm:mt-16 sm:pt-12">
  {/* Heading */}
  <div className="mb-7 text-center sm:mb-8 sm:text-left">
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 sm:text-sm">
      <span className="h-2 w-2 rounded-full bg-amber-400" />
      Please Read Carefully
    </span>

    <h3 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
      Important Information
    </h3>

    <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:mx-0 sm:text-base">
      পোর্টালে যুক্ত হওয়ার আগে নিচের তথ্যগুলো ভালোভাবে পড়ে নাও।
    </p>

    <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-amber-400 to-indigo-400 sm:mx-0" />
  </div>

  {/* Information cards */}
  <ul className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
    {NOTES.map((n, i) => (
      <li
        key={n}
        className="group relative flex min-w-0 items-start gap-3 overflow-hidden rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/80 hover:shadow-lg hover:shadow-indigo-950/5 sm:gap-4 sm:p-5"
      >
        {/* Hover accent */}
        <div className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-amber-300 to-indigo-400 transition-transform duration-300 group-hover:scale-y-100" />

        {/* Icon */}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-lg transition-colors duration-300 group-hover:border-amber-200 group-hover:bg-amber-50 sm:h-11 sm:w-11">
          <span aria-hidden="true">ℹ️</span>
        </span>

        {/* Text */}
        <span className="min-w-0 flex-1 break-words pt-1 text-sm leading-7 text-slate-700 sm:text-base">
          {n}
        </span>

        {/* Item number */}
        <span className="shrink-0 pt-1 text-xs font-bold tracking-wider text-indigo-200 transition-colors duration-300 group-hover:text-amber-500">
          {String(i + 1).padStart(2, "0")}
        </span>
      </li>
    ))}
  </ul>
</div>

  </div>
</section>


      {/* ---------- Footer / contact ---------- */}
     <Footer></Footer>
    </div>
  );
}

function SectionTitle({ bn, en }: { bn: string; en: string }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{bn} <span className="text-lg font-medium text-slate-500">({en})</span></h2>
      <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-amber-400" />
    </div>
  );
}
