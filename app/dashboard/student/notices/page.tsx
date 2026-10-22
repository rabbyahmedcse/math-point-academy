
import { PageHeader, Empty } from "@/components/ui/bits";
import { requireRole } from "@/lib/session";
import { studentNotices } from "@/lib/student-data";
import { formatDate } from "@/lib/utils";

export default async function StudentNotices() {
  const user = await requireRole(["student"]);
  const notices = await studentNotices(user.batchId, 50);

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-8 -z-10 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-4 top-72 -z-10 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"
      />

      {/* Page header */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-5 shadow-sm shadow-indigo-100/50 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-violet-300/20 blur-3xl"
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
              <path d="M12 3 21 8v6c0 4-3.8 6.5-9 8-5.2-1.5-9-4-9-8V8l9-5Z" />
              <path d="M9 12h6M12 9v6" strokeLinecap="round" />
            </svg>
            MATH POINT ACADEMY
          </div>

          <PageHeader title="Notice board" />

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Stay informed about important announcements, class updates, and
            notices from your academy.
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
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Important updates
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
                  <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
                  <path d="M14 3v6h6M8 13h8M8 17h6" strokeLinecap="round" />
                </svg>
              </span>
              Notices & attachments
            </span>
          </div>
        </div>
      </section>

      {/* Notices list */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              Latest announcements
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Notices and information shared by your academy.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Notice board
          </span>
        </div>

        {notices.length === 0 ? (
          <div className="overflow-hidden rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-5 sm:p-8">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 shadow-inner">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
                  <path d="M14 3v6h6M8 13h8M8 17h5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mb-1 font-bold text-slate-800">
                No notices yet
              </h3>
              <p className="mb-4 text-sm text-slate-500">
                There are no announcements to display right now.
              </p>
              <Empty>No notices.</Empty>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <article
                key={String(n._id)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="p-4 pl-5 sm:p-6 sm:pl-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 transition-transform duration-300 group-hover:scale-105">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M12 3 21 8v6c0 4-3.8 6.5-9 8-5.2-1.5-9-4-9-8V8l9-5Z" />
                        <path d="M9 12h6M12 9v6" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-bold leading-6 text-slate-800 transition-colors duration-200 group-hover:text-indigo-700 sm:text-lg">
                        {n.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" strokeLinecap="round" />
                          </svg>
                          {formatDate(n.publishDate)}
                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />

                        <span className="inline-flex items-center gap-1.5">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="8" r="3.5" />
                            <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
                          </svg>
                          {n.createdByName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                      {n.body}
                    </p>
                  </div>

                  {n.attachmentUrl && (
                    <div className="mt-4">
                      <a
                        href={n.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/attachment inline-flex max-w-full items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2.5 text-sm font-semibold text-indigo-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/attachment:-translate-y-0.5"
                          aria-hidden="true"
                        >
                          <path d="m21.4 11.1-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.2a1.9 1.9 0 0 1-2.6-2.6l8.5-8.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="break-words">Attachment</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        >
                          <path d="M14 4h6v6M20 4l-9 9" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" strokeLinecap="round" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-indigo-100 to-transparent opacity-80" />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
