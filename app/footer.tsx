
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import {
  MailIcon,
  PhoneIcon,
  PinIcon,
  UserIcon,
  BookIcon,
} from "@/components/ui/icons";

async function safe<T>(
  fn: () => Promise<T>,
  fallback: T,
  ms = 2500
): Promise<T> {
  try {
    return await Promise.race([
      fn(),
      new Promise<T>((resolve) =>
        setTimeout(() => resolve(fallback), ms)
      ),
    ]);
  } catch {
    return fallback;
  }
}

export default async function Footer() {
  const settings = await safe(
    async () => {
      await connectDB();
      return Settings.findById("main").lean();
    },
    null
  );

  const name = settings?.coachingName || SITE.name;
  const address = settings?.address || SITE.address;

  const phones = settings?.phone
    ? [{ number: settings.phone, note: "" }]
    : SITE.phones;

  const facebook = settings?.facebookUrl || SITE.facebook;
  const waNumber = SITE.phones[0]?.number?.replace(/^0/, "880");

  return (
    <footer
      id="contact"
      className="relative scroll-mt-24 overflow-hidden border-t border-indigo-900/50 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-300"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-amber-400/5 blur-3xl" />

      {/* Footer content */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-9 px-5 py-12 sm:px-6 sm:py-14 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-8 lg:px-8 lg:py-16">

        {/* Academy information */}
        <div className="min-w-0">
          <a
            href="/"
            className="group inline-flex max-w-full items-center gap-3"
          >
            <div className="shrink-0 rounded-2xl border border-amber-300/20 bg-white/5 p-1.5 shadow-lg shadow-indigo-950/30 transition-all duration-300 group-hover:border-amber-300/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-mark.png"
                alt={`${name} logo`}
                width={56}
                height={56}
                className="h-12 w-12 rounded-xl object-contain sm:h-14 sm:w-14"
              />
            </div>

            <div className="min-w-0">
              <p className="break-words text-base font-extrabold text-white transition-colors duration-300 group-hover:text-amber-300 sm:text-lg">
                {name}
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-300 sm:text-sm">
                {SITE.tagline}
              </p>
            </div>
          </a>

          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            গণিত (ষষ্ঠ–দশম) ও ICT (HSC) বিষয়ে বিশেষায়িত যত্ন।
            শিক্ষার্থীদের মজবুত ভিত্তি গড়ে তোলাই আমাদের লক্ষ্য।
          </p>

          {/* Decorative accent */}
          <div className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-amber-300 to-indigo-400" />
        </div>

        {/* Contact information */}
        <div className="min-w-0">
          <h4 className="mb-5 flex items-center gap-2 text-base font-bold text-white sm:text-lg">
            <span className="h-5 w-1 rounded-full bg-amber-400" />
            Contact / যোগাযোগ
          </h4>

          <ul className="space-y-4 text-sm">
            {phones.map((phone) => (
              <li
                key={phone.number}
                className="flex min-w-0 items-start gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-300 transition-colors duration-300 hover:border-amber-300/30 hover:bg-amber-300/10">
                  <PhoneIcon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1 pt-1.5">
                  <a
                    href={`tel:${phone.number}`}
                    className="break-words text-slate-300 transition-colors hover:text-amber-300"
                  >
                    {phone.number}
                  </a>

                  {phone.note && (
                    <p className="mt-1 text-xs text-slate-500">
                      {phone.note}
                    </p>
                  )}
                </div>
              </li>
            ))}

            {!settings?.phone && waNumber && (
              <li className="pl-12">
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-wrap items-center gap-1 text-emerald-400 transition-colors hover:text-emerald-300 hover:underline"
                >
                  WhatsApp-এ মেসেজ করুন
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            )}

            <li className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-300">
                <MailIcon className="h-4 w-4" />
              </span>

              <a
                href={`mailto:${SITE.email}`}
                className="min-w-0 break-all pt-2 text-slate-300 transition-colors hover:text-amber-300"
              >
                {SITE.email}
              </a>
            </li>

            {facebook && (
              <li className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-black text-amber-300"
                >
                  f
                </span>

                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pt-2 text-slate-300 transition-colors hover:text-amber-300"
                >
                  Facebook page ↗
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Address */}
        <div className="min-w-0">
          <h4 className="mb-5 flex items-center gap-2 text-base font-bold text-white sm:text-lg">
            <span className="h-5 w-1 rounded-full bg-amber-400" />
            Address / ঠিকানা
          </h4>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-300">
              <PinIcon className="h-4 w-4" />
            </span>

            <p className="min-w-0 flex-1 break-words pt-1.5 text-sm leading-7 text-slate-400">
              {address}
            </p>
          </div>
        </div>

        {/* Director information */}
        <div className="min-w-0">
          <h4 className="mb-5 flex items-center gap-2 text-base font-bold text-white sm:text-lg">
            <span className="h-5 w-1 rounded-full bg-amber-400" />
            Director
          </h4>

          <ul className="space-y-4 text-sm">
            <li className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-300">
                <UserIcon className="h-4 w-4" />
              </span>

              <span className="min-w-0 break-words pt-1.5 font-semibold leading-6 text-white">
                {SITE.director.name}
              </span>
            </li>

            <li className="pl-12">
              <p className="text-xs leading-6 text-slate-500">
                Profession
              </p>
              <p className="break-words leading-6 text-slate-300">
                {SITE.director.profession}
              </p>
            </li>

            <li className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-300">
                <BookIcon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1 pt-1">
                <p className="text-xs leading-6 text-slate-500">
                  Educational Qualifications
                </p>
                <p className="break-words leading-6 text-slate-300">
                  {SITE.director.education}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative border-t border-white/10 bg-slate-950/40 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <p className="text-xs leading-6 text-slate-500">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>

          <p className="text-xs text-slate-500">
            Made with{" "}
            <span className="text-amber-400">♥</span>
            {" "}for better learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
