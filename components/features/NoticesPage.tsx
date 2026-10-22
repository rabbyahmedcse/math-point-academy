
import { PageHeader, Empty, Badge } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor, batchScope } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { Notice } from "@/models/Notice";
import { Batch } from "@/models/Batch";
import { createNotice, deleteNotice } from "@/actions/notices";

export default async function NoticesPage() {
  const user = await requireRole(["admin", "teacher"]);

  await connectDB();

  const batches = await batchesFor(user);
  const mine = await Batch.find(
    batchScope(user),
    { _id: 1, name: 1 },
  ).lean();

  const names = new Map(
    (await Batch.find({}, { name: 1 }).lean()).map((b) => [
      String(b._id),
      b.name,
    ]),
  );

  const notices = await Notice.find(
    user.role === "admin"
      ? {}
      : {
          $or: [
            { createdBy: user.id },
            {
              audience: "batches",
              batchIds: { $in: mine.map((b) => b._id) },
            },
          ],
        },
  )
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const canAll = user.role === "admin" || user.permissions.noticeAll;

  return (
    <main className="relative isolate min-w-0 space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-0 -z-10 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-72 -z-10 h-56 w-56 rounded-full bg-violet-200/20 blur-3xl"
      />

      {/* Page heading */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-[0_16px_50px_-35px_rgba(79,70,229,0.35)] sm:p-7 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[24px] border-indigo-100/40 sm:h-64 sm:w-64"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 hover:rotate-3 hover:scale-105 sm:h-16 sm:w-16">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 sm:h-8 sm:w-8"
              aria-hidden="true"
            >
              <path d="M5 4.5h14a1 1 0 0 1 1 1v14H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z" />
              <path d="M7 8h9M7 12h6" />
              <path d="m14 16 2 2 4-4" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Communication center
            </span>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Notices
              <span className="text-indigo-600"> & Updates</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Publish important announcements to all students or selected
              batches and keep everyone informed.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4 text-indigo-600"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
                Important announcements
              </span>

              <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4 text-violet-600"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Batch-wise communication
              </span>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-white bg-white/75 px-4 py-3 shadow-sm backdrop-blur-md md:flex">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-slate-600">
              Notice workspace
            </span>
          </div>
        </div>
      </section>

      {/* Create notice */}
      <details className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl transition-shadow duration-300 open:shadow-lg open:shadow-indigo-500/[0.05]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 transition-colors duration-200 hover:bg-indigo-50/40 sm:p-5 [&::-webkit-details-marker]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 group-open:rotate-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">Create a notice</h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Write an announcement and choose its audience
              </p>
            </div>
          </div>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-300 group-open:rotate-45 group-open:border-indigo-200 group-open:text-indigo-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </summary>

        <div className="border-t border-slate-100 p-4 sm:p-6">
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/70 p-3.5 sm:p-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
            </div>
            <p className="text-xs leading-5 text-slate-600 sm:text-sm">
              Choose who should receive this notice. You can publish to
              selected batches or, when permitted, to all students or teachers.
            </p>
          </div>

          <ActionForm
            action={createNotice}
            submitLabel="Publish notice"
            className="space-y-5"
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Field label="Notice title">
                  <input
                    name="title"
                    required
                    className="input"
                    placeholder="e.g. Upcoming exam schedule"
                  />
                </Field>
              </div>

              <div className="lg:col-span-2">
                <Field label="Notice details">
                  <textarea
                    name="body"
                    required
                    rows={5}
                    className="input min-h-32 resize-y"
                    placeholder="Write the announcement details here..."
                  />
                </Field>
              </div>

              <Field label="Audience">
                <select
                  name="audience"
                  defaultValue="batches"
                  className="input"
                >
                  <option value="batches">Selected batches</option>
                  {canAll && <option value="all">All students</option>}
                  {user.role === "admin" && (
                    <option value="teachers">Teachers only</option>
                  )}
                </select>
              </Field>

              <Field label="Attachment link (optional)">
                <input
                  name="attachmentUrl"
                  type="url"
                  className="input"
                  placeholder="https://..."
                />
              </Field>

              <Field label="Publish date">
                <input
                  type="date"
                  name="publishDate"
                  className="input"
                />
              </Field>

              <Field label="Expires on">
                <input
                  type="date"
                  name="expiresAt"
                  className="input"
                />
              </Field>
            </div>

            <Field label="Select batches">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                {batches.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {batches.map((b) => (
                      <label
                        key={String(b._id)}
                        className="group/option flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-sm text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-50/70"
                      >
                        <input
                          type="checkbox"
                          name="batchIds"
                          value={String(b._id)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                        />
                        <span className="min-w-0 break-words font-medium">
                          {b.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                    No batches available.
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                These checkboxes are used when the audience is “Selected batches”.
              </p>
            </Field>
          </ActionForm>
        </div>
      </details>

      {/* Notice list */}
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-600">
              Updates
            </span>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Published notices
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest announcements and shared information
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {notices.length} {notices.length === 1 ? "notice" : "notices"}
          </span>
        </div>

        {notices.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm sm:p-6">
            <Empty>No notices yet.</Empty>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <article
                key={String(n._id)}
                className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/[0.06] sm:p-5"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 opacity-70 transition-opacity group-hover:opacity-100"
                />

                <div className="min-w-0 pl-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                          <path d="M10 21h4" />
                        </svg>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
                          {n.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          By {n.createdByName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge
                        value={n.audience === "all" ? "active" : "scheduled"}
                      />
                      <span className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {n.audience === "all"
                          ? "All students"
                          : n.audience === "teachers"
                            ? "Teachers"
                            : n.batchIds
                                .map((b) => names.get(String(b)))
                                .filter(Boolean)
                                .join(", ") || "Selected batches"}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {n.body}
                  </p>

                  {n.attachmentUrl && (
                    <a
                      href={n.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:border-indigo-200 hover:bg-indigo-100/70"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48" />
                      </svg>
                      <span className="break-all">Open attachment</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M14 3h7v7M21 3l-9 9" />
                        <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
                      </svg>
                    </a>
                  )}

                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M16 3v4M8 3v4M3 11h18" />
                        </svg>
                        Published: {formatDate(n.publishDate)}
                      </span>

                      {n.expiresAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                          Expires: {formatDate(n.expiresAt)}
                        </span>
                      )}
                    </div>

                    {(user.role === "admin" ||
                      String(n.createdBy) === user.id) && (
                      <ActionForm
                        action={deleteNotice}
                        submitLabel="Delete notice"
                        submitClassName="btn btn-secondary btn-sm"
                        className="shrink-0"
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={String(n._id)}
                        />
                      </ActionForm>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
