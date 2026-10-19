import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import { MailIcon, PhoneIcon, PinIcon, UserIcon, BookIcon } from "@/components/ui/icons";

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
      <header className="sticky top-0 z-20 border-b border-amber-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 font-bold text-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-lg" />
            <span className="truncate">{name}</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <a href="#about" className="hidden px-2.5 py-2 text-slate-600 hover:text-amber-700 md:inline">আমাদের সম্পর্কে</a>
            <a href="#specialities" className="hidden px-2.5 py-2 text-slate-600 hover:text-amber-700 md:inline">বৈশিষ্ট্য</a>
            <a href="#portal" className="hidden px-2.5 py-2 text-slate-600 hover:text-amber-700 md:inline">Student Portal</a>
            <a href="#contact" className="hidden px-2.5 py-2 text-slate-600 hover:text-amber-700 md:inline">যোগাযোগ</a>
            {dash ? (
              <Link href={dash} className="btn btn-primary">Go to dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary">Sign in</Link>
                <Link href="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:py-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt={`${SITE.name} — ${SITE.tagline}`} width={1408} height={768} className="mx-auto w-full max-w-2xl rounded-2xl shadow-2xl ring-1 ring-amber-400/40" />
          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg sm:leading-9">{SITE.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {dash ? (
              <Link href={dash} className="rounded-xl bg-amber-400 px-7 py-3 text-sm font-bold text-slate-900 hover:bg-amber-300">Open my dashboard</Link>
            ) : (
              <>
                <Link href="/register" className="rounded-xl bg-amber-400 px-7 py-3 text-sm font-bold text-slate-900 hover:bg-amber-300">ভর্তি / Student Register</Link>
                <Link href="/register/parent" className="rounded-xl border border-white/30 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10">Parent account</Link>
                <Link href="/login" className="rounded-xl border border-white/30 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ---------- About us ---------- */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14">
        <SectionTitle bn="আমাদের সম্পর্কে" en="About Us" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {SITE.about.map((a) => (
            <article key={a.title} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
              <span className="text-3xl" aria-hidden>{a.icon}</span>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{a.title}</h3>
              <p className="mt-2 leading-8 text-slate-700">{a.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Specialities ---------- */}
      <section id="specialities" className="scroll-mt-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionTitle bn="প্রধান বৈশিষ্ট্যসমূহ" en="Our Specialities" />
          <p className="mt-3 text-center text-lg font-semibold text-slate-700">{SITE.specialitiesTitle}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SITE.specialities.map((s) => (
              <article key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-2xl" aria-hidden>{s.icon}</span>
                <h3 className="mt-3 font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 leading-7 text-slate-600">{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Student portal ---------- */}
      <section id="portal" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14">
        <SectionTitle bn="অনলাইন স্টুডেন্ট পোর্টাল" en="How to join" />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.t} className="card">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-900">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </li>
          ))}
        </ol>
        <h3 className="mb-3 mt-10 text-lg font-semibold text-slate-900">Important information</h3>
        <ul className="grid gap-3 md:grid-cols-2">
          {NOTES.map((n) => (
            <li key={n} className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><span>ℹ️</span><span>{n}</span></li>
          ))}
        </ul>
      </section>

      {/* ---------- Footer / contact ---------- */}
      <footer id="contact" className="scroll-mt-16 bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="" width={56} height={56} className="h-14 w-14 rounded-xl" />
              <div><p className="font-bold text-white">{name}</p><p className="text-xs text-amber-300">{SITE.tagline}</p></div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">গণিত (ষষ্ঠ – দশম) ও ICT (HSC) বিষয়ে বিশেষায়িত যত্ন।</p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">Contact / যোগাযোগ</h4>
            <ul className="space-y-2.5 text-sm">
              {phones.map((p) => (
                <li key={p.number} className="flex items-start gap-2.5">
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span><a href={`tel:${p.number}`} className="hover:text-white">{p.number}</a>{p.note && <span className="text-slate-500"> ({p.note})</span>}</span>
                </li>
              ))}
              {!settings?.phone && (
                <li className="pl-6"><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">WhatsApp-এ মেসেজ করুন →</a></li>
              )}
              <li className="flex items-start gap-2.5">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <a href={`mailto:${SITE.email}`} className="break-all hover:text-white">{SITE.email}</a>
              </li>
              {facebook && (
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-amber-300 text-[10px] font-black text-slate-900" aria-hidden>f</span>
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook page</a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">Address / ঠিকানা</h4>
            <p className="flex items-start gap-2.5 text-sm leading-7"><PinIcon className="mt-1 h-4 w-4 shrink-0 text-amber-300" />{address}</p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">Director</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5"><UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><span className="font-medium text-white">{SITE.director.name}</span></li>
              <li className="pl-6 text-slate-400">Profession: {SITE.director.profession}</li>
              <li className="flex items-start gap-2.5"><BookIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><span><span className="text-slate-400">Educational Qualifications:</span> {SITE.director.education}</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </div>
      </footer>
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
