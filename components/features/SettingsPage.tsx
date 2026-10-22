
import { TableWrap } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { AuditLog, Settings } from "@/models/Misc";
import { saveSettings } from "@/actions/admin";
import { SITE } from "@/lib/site";

export default async function SettingsPage() {
  await requireRole(["admin"]);
  await connectDB();

  const [s, logs] = await Promise.all([
    Settings.findById("main").lean(),
    AuditLog.find().sort({ at: -1 }).limit(40).lean(),
  ]);

  return (
    <main className="relative isolate min-w-0 space-y-7 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-0 -z-10 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-96 -z-10 h-56 w-56 rounded-full bg-violet-200/20 blur-3xl"
      />

      {/* Page heading */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-[0_16px_50px_-35px_rgba(79,70,229,0.35)] sm:p-7 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full border-[24px] border-indigo-100/40 sm:h-64 sm:w-64"
        />

        <div className="relative flex items-start gap-4">
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
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3H3.7a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Administration
            </span>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              System <span className="text-indigo-600">Settings</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Manage your coaching profile, public contact information and
              review recent administrative activity.
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
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8M8 13h5" />
                </svg>
                Coaching profile
              </span>

              <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-violet-600"
                  aria-hidden="true"
                >
                  <path d="M12 8v4l3 2" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Activity history
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Settings form */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg hover:shadow-indigo-500/[0.04]">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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
              <path d="M4 5h16v14H4z" />
              <path d="M8 9h8M8 13h5" />
              <path d="m14 16 2 2 4-4" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="font-black text-slate-900">
              Coaching profile
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              These details may appear on your homepage and payment receipts.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          <ActionForm
            action={saveSettings}
            submitLabel="Save settings"
            resetOnSuccess={false}
            className="space-y-5"
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Field label="Coaching name">
                  <input
                    name="coachingName"
                    required
                    defaultValue={s?.coachingName ?? SITE.name}
                    className="input"
                    placeholder="Enter coaching name"
                  />
                </Field>
              </div>

              <div className="lg:col-span-2">
                <Field label="Facebook page link">
                  <input
                    name="facebookUrl"
                    type="url"
                    defaultValue={s?.facebookUrl ?? ""}
                    placeholder="https://facebook.com/..."
                    className="input"
                  />
                </Field>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Displayed in the homepage footer. Leave empty if not needed.
                </p>
              </div>

              <div>
                <Field label="Phone number">
                  <input
                    name="phone"
                    defaultValue={s?.phone ?? ""}
                    placeholder="Enter contact number"
                    className="input"
                  />
                </Field>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Leave empty to use the default number from lib/site.ts.
                </p>
              </div>

              <div>
                <Field label="Coaching address">
                  <input
                    name="address"
                    defaultValue={s?.address ?? ""}
                    placeholder="Enter coaching address"
                    className="input"
                  />
                </Field>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Displayed on the homepage and payment receipts.
                </p>
              </div>
            </div>
          </ActionForm>
        </div>
      </section>

      {/* Activity history */}
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-9 w-1 rounded-full bg-violet-500" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-600">
                System records
              </span>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest administrative actions recorded by the system.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            {logs.length} records
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
            <p className="mt-3 font-bold text-slate-800">
              No activity recorded yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Recent system activity will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-md">
            <TableWrap>
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="th">When</th>
                  <th className="th">Who</th>
                  <th className="th">Action</th>
                  <th className="th">Detail</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr
                    key={String(l._id)}
                    className="group transition-colors duration-200 hover:bg-indigo-50/40"
                  >
                    <td className="td whitespace-nowrap text-xs text-slate-500">
                      {l.at.toLocaleString("en-GB", {
                        timeZone: process.env.APP_TIMEZONE ?? "Asia/Dhaka",
                      })}
                    </td>

                    <td className="td min-w-[130px]">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-xs font-extrabold text-indigo-700">
                          {l.actorName?.trim()?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {l.actorName}
                        </span>
                      </div>
                    </td>

                    <td className="td min-w-[130px]">
                      <span className="inline-flex max-w-full break-all rounded-lg border border-indigo-100 bg-indigo-50/70 px-2 py-1 font-mono text-[11px] font-semibold text-indigo-700">
                        {l.action}
                      </span>
                    </td>

                    <td className="td min-w-[200px] whitespace-normal break-words text-xs leading-5 text-slate-500">
                      {l.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}
      </section>
    </main>
  );
}
