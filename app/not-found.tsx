import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">404 · Page not found</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">এই পেজটি পাওয়া যায়নি</h1>
        <p className="mt-3 text-slate-600">লিংকটি ভুল হতে পারে অথবা পেজটি সরানো হয়েছে।</p>
        <Link href="/" className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700">হোম পেজে ফিরে যান</Link>
      </section>
    </main>
  );
}
