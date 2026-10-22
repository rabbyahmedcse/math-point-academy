import {
  PageHeader,
  Empty,
  Badge,
  TableWrap,
} from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Batch } from "@/models/Batch";
import {
  createTeacher,
  updateTeacher,
  resetTeacherPassword,
  updatePermissions,
} from "@/actions/admin";
import { setUserActive } from "@/actions/students";

const PERMS: [string, string][] = [
  ["manageBatches", "Create / edit own batches"],
  ["approveStudents", "Approve registrations & assign batches"],
  ["feeEntry", "Enter fee payments"],
  ["noticeAll", "Send notices to ALL students"],
];

export default async function TeachersPage() {
  await requireRole(["admin"]);
  await connectDB();

  const teachers = await User.find({ role: "teacher" })
    .sort({ name: 1 })
    .lean();

  const counts = await Batch.aggregate([
    { $unwind: "$teacherIds" },
    {
      $group: {
        _id: "$teacherIds",
        n: { $sum: 1 },
      },
    },
  ]);

  const n = new Map(
    counts.map((c) => [String(c._id), c.n as number]),
  );

  const activeCount = teachers.filter((t) => t.status === "active").length;
  const inactiveCount = teachers.length - activeCount;

  return (
    <main className="relative isolate min-w-0 space-y-7 pb-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-0 -z-10 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-96 -z-10 h-56 w-56 rounded-full bg-violet-200/20 blur-3xl"
      />

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
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <path d="M20 8v6M17 11h6" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Staff administration
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Teachers <span className="text-indigo-600">Management</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Create teacher accounts, manage permissions, reset passwords and
              control account status from one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                {teachers.length} total teachers
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {activeCount} active
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {inactiveCount} inactive
              </span>
            </div>
          </div>
        </div>
      </section>

      <details className="group overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 open:shadow-lg open:shadow-indigo-500/[0.06]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/80 to-violet-50/70 px-4 py-4 transition-colors hover:from-indigo-100/80 hover:to-violet-100/70 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
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
            </span>
            <span className="min-w-0">
              <span className="block font-extrabold text-slate-900">
                Create teacher account
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                Add a teacher and provide their initial login credentials.
              </span>
            </span>
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 shrink-0 text-indigo-600 transition-transform duration-200 group-open:rotate-45"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </summary>

        <div className="border-t border-slate-100 p-4 sm:p-5">
          <ActionForm
            action={createTeacher}
            submitLabel="Create account"
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  name="name"
                  required
                  className="input"
                  placeholder="Enter teacher's full name"
                />
              </Field>
              <Field label="Email (login)">
                <input
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="teacher@example.com"
                />
              </Field>
              <Field label="Mobile (optional)">
                <input
                  name="phone"
                  className="input"
                  placeholder="01XXXXXXXXX"
                />
              </Field>
              <Field label="Temporary password (min 8)">
                <input
                  name="password"
                  type="text"
                  required
                  minLength={8}
                  className="input"
                  autoComplete="off"
                  placeholder="Create a temporary password"
                />
              </Field>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-xs leading-5 text-amber-900">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M12 3 2.8 20h18.4L12 3Z" />
                <path d="M12 9v4M12 16h.01" />
              </svg>
              <p>
                The teacher must change this password at first sign-in. Use a
                password made for this system, not their Gmail password.
              </p>
            </div>
          </ActionForm>
        </div>
      </details>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-1 h-9 w-1 shrink-0 rounded-full bg-indigo-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                Staff directory
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                All teachers
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Review teaching assignments, update permissions and manage
                account access.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {teachers.length} {teachers.length === 1 ? "teacher" : "teachers"}
          </span>
        </div>

        {teachers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <Empty>No teachers yet.</Empty>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-md">
            <TableWrap>
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="th">Teacher</th>
                  <th className="th">Batches</th>
                  <th className="th">Status</th>
                  <th className="th">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t) => (
                  <tr
                    key={String(t._id)}
                    className="group transition-colors duration-200 hover:bg-indigo-50/40"
                  >
                    <td className="td min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-black text-indigo-700 ring-1 ring-indigo-100/80">
                          {t.name?.trim()?.charAt(0)?.toUpperCase() || "T"}
                        </span>
                        <div className="min-w-0">
                          <p className="break-words font-bold text-slate-800">
                            {t.name}
                          </p>
                          <p className="mt-0.5 break-all text-xs text-slate-500">
                            {t.email}
                          </p>
                          {t.phone && (
                            <p className="mt-1 break-words text-xs text-slate-400">
                              {t.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-sm font-bold text-indigo-700">
                        {n.get(String(t._id)) ?? 0}
                      </span>
                    </td>
                    <td className="td">
                      <Badge value={t.status} />
                    </td>
                    <td className="td min-w-[110px]">
                      <details className="group/manage relative">
                        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 [&::-webkit-details-marker]:hidden">
                          Manage
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5 transition-transform group-open/manage:rotate-180"
                            aria-hidden="true"
                          >
                            <path d="m5 7 5 5 5-5" />
                          </svg>
                        </summary>

                        <div className="relative z-20 mt-3 w-full min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/10 sm:min-w-[18rem]">
                          <div>
                            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                              Teacher profile
                            </p>
                            <ActionForm
                              action={updateTeacher}
                              submitLabel="Save profile"
                              submitClassName="btn btn-secondary btn-sm"
                              resetOnSuccess={false}
                              className="space-y-2"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={String(t._id)}
                              />
                              <label className="block">
                                <span className="label">Full name</span>
                                <input
                                  name="name"
                                  defaultValue={t.name}
                                  required
                                  className="input"
                                />
                              </label>
                              <label className="block">
                                <span className="label">Mobile</span>
                                <input
                                  name="phone"
                                  defaultValue={t.phone ?? ""}
                                  className="input"
                                  placeholder="Mobile"
                                />
                              </label>
                            </ActionForm>
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-violet-600">
                              Permissions
                            </p>
                            <ActionForm
                              action={updatePermissions}
                              submitLabel="Save permissions"
                              submitClassName="btn btn-secondary btn-sm"
                              resetOnSuccess={false}
                              className="space-y-3"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={String(t._id)}
                              />
                              {PERMS.map(([k, label]) => (
                                <label
                                  key={k}
                                  className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-sm text-slate-700 transition-colors hover:border-indigo-100 hover:bg-indigo-50/60"
                                >
                                  <input
                                    type="checkbox"
                                    name={k}
                                    defaultChecked={
                                      (
                                        t.permissions as
                                          | Record<string, boolean>
                                          | undefined
                                      )?.[k] ?? false
                                    }
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                                  />
                                  <span className="leading-5">{label}</span>
                                </label>
                              ))}
                            </ActionForm>
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                              Account security
                            </p>
                            <ActionForm
                              action={resetTeacherPassword}
                              submitLabel="Reset password"
                              submitClassName="btn btn-secondary btn-sm"
                              className="space-y-2"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={String(t._id)}
                              />
                              <input
                                name="password"
                                type="password"
                                minLength={8}
                                required
                                placeholder="New temporary password"
                                className="input"
                                autoComplete="new-password"
                              />
                            </ActionForm>
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                              Account status
                            </p>
                            <ActionForm
                              action={setUserActive}
                              hideSubmit
                              className=""
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={String(t._id)}
                              />
                              <input
                                type="hidden"
                                name="active"
                                value={String(t.status !== "active")}
                              />
                              <button
                                className={
                                  t.status === "active"
                                    ? "btn btn-danger btn-sm w-full"
                                    : "btn btn-primary btn-sm w-full"
                                }
                              >
                                {t.status === "active"
                                  ? "Deactivate account"
                                  : "Activate account"}
                              </button>
                            </ActionForm>
                          </div>
                        </div>
                      </details>
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
