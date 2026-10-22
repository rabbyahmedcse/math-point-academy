
import { ResourceBrowser } from "@/components/features/resources/ResourceBrowser";
import { requireRole } from "@/lib/session";
import { loadResources } from "@/lib/resource-data";

export default async function StudentMaterials() {
  const user = await requireRole(["student"]);
  const items = await loadResources(user); // own batch, already-published items only

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Ambient background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-8 -z-10 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-4 top-72 -z-10 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"
      />

      {/* Page heading */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-5 shadow-sm shadow-indigo-100/50 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-violet-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-indigo-300/10 blur-2xl"
        />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
              <path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 10h8" strokeLinecap="round" />
            </svg>
            LEARNING CENTER
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Study Materials
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Here you can find all your homework, quizzes, class materials and
            important resources.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm sm:text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
                  <path d="M14 3.5V8h4M8 12h8M8 16h6" strokeLinecap="round" />
                </svg>
              </span>
              Class materials
            </span>

            <span className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm sm:text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M8 4h8M8 8h8M6 3h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z" />
                  <path d="m9 13 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Homework & quizzes
            </span>
          </div>
        </div>
      </section>

      {/* Resource browser */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 transition-shadow duration-300 hover:shadow-md">
        <div className="flex items-center gap-3 border-b border-indigo-100/80 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/70">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800 sm:text-lg">
              Your learning resources
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
              Browse the materials available for your studies.
            </p>
          </div>
        </div>

        <div className="min-w-0 p-3 sm:p-5">
          <ResourceBrowser
            mode="student"
            items={items}
            subtitle="Here you can find all your homework, quizzes, class materials and important resources."
          />
        </div>
      </section>
    </div>
  );
}
