
import { PageHeader, Empty, Badge, TableWrap } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchScope } from "@/lib/access";
import { cn, money } from "@/lib/utils";
import { Batch } from "@/models/Batch";
import { User } from "@/models/User";
import { createBatch, updateBatch, setBatchActive } from "@/actions/batches";

function SummaryCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string | number;
  description: string;
  tone: "indigo" | "emerald" | "violet";
}) {
  const styles = {
    indigo: {
      icon: "bg-indigo-100 text-indigo-700",
      glow: "bg-indigo-200/30",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-700",
      glow: "bg-emerald-200/30",
    },
    violet: {
      icon: "bg-violet-100 text-violet-700",
      glow: "bg-violet-200/30",
    },
  }[tone];

  return (
    <div className="group relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_45px_-28px_rgba(79,70,229,0.3)]">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 -z-10 h-28 w-28 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125",
          styles.glow,
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110",
            styles.icon,
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
          >
            {tone === "indigo" ? (
              <>
                <rect x="3.5" y="4" width="17" height="16" rx="3" />
                <path d="M8 8h8M8 12h5M8 16h3" strokeLinecap="round" />
              </>
            ) : tone === "emerald" ? (
              <>
                <circle cx="9" cy="8" r="3" />
                <path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19M16 5.5a3 3 0 0 1 0 5.5M17 13a4 4 0 0 1 3.5 4v2" />
              </>
            ) : (
              <>
                <path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" />
                <path d="m5 10 7 3.8 7-3.8M5 14l7 4 7-4" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
        </span>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">
        {eyebrow}
      </p>
      <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default async function BatchesPage() {
  const user = await requireRole(["admin", "teacher"]);
  await connectDB();

  const isAdmin = user.role === "admin";
  const canManage = isAdmin || user.permissions.manageBatches;

  const [batches, teachers, counts] = await Promise.all([
    Batch.find(batchScope(user)).sort({ status: 1, name: 1 }).lean(),
    isAdmin
      ? User.find({ role: "teacher", status: "active" })
          .sort({ name: 1 })
          .lean()
      : Promise.resolve([]),
    User.aggregate([
      { $match: { role: "student", status: "active" } },
      { $group: { _id: "$batchId", n: { $sum: 1 } } },
    ]),
  ]);

  const n = new Map(counts.map((c) => [String(c._id), c.n as number]));

  const tName = new Map(
    (
      await User.find({ role: "teacher" }, { name: 1 }).lean()
    ).map((t) => [String(t._id), t.name]),
  );

  const activeCount = batches.filter((b) => b.status === "active").length;
  const inactiveCount = batches.length - activeCount;
  const totalStudents = batches.reduce(
    (sum, b) => sum + (n.get(String(b._id)) ?? 0),
    0,
  );

  const fields = (b?: (typeof batches)[number]) => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Batch name">
          <input
            name="name"
            required
            defaultValue={b?.name}
            className="input w-full"
            placeholder="Class 9 Science A"
          />
        </Field>

        <Field label="Class">
          <input
            name="className"
            required
            defaultValue={b?.className}
            className="input w-full"
            placeholder="e.g. Class 9"
          />
        </Field>

        <Field label="Subject">
          <input
            name="subject"
            required
            defaultValue={b?.subject}
            className="input w-full"
            placeholder="e.g. Mathematics"
          />
        </Field>

        <Field label="Monthly fee (৳)">
          <input
            name="monthlyFee"
            type="number"
            min={0}
            required
            defaultValue={b?.monthlyFee ?? 0}
            className="input w-full"
          />
        </Field>
      </div>

      <Field label="Description" className="mt-2">
        <input
          name="description"
          defaultValue={b?.description}
          className="input w-full"
          placeholder="Optional batch details"
        />
      </Field>

      {isAdmin && (
        <Field
          label="Teachers (hold Ctrl/Cmd to select several)"
          className="mt-2"
        >
          <select
            name="teacherIds"
            multiple
            defaultValue={(b?.teacherIds ?? []).map(String)}
            className="input h-32 w-full"
          >
            {teachers.map((t) => (
              <option key={String(t._id)} value={String(t._id)}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Select one or more active teachers for this batch.
          </p>
        </Field>
      )}
    </div>
  );

  return (
    <div className="relative isolate space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/20 blur-3xl"
      />

      <PageHeader
        title="Batches"
        subtitle="Manage classes, teachers, students and monthly fees. Batches are deactivated, never deleted, so history stays intact."
      />

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Total batches"
          value={batches.length}
          description="Batches available to your account"
          tone="indigo"
        />
        <SummaryCard
          label="Active batches"
          value={activeCount}
          description="Currently active classes"
          tone="emerald"
        />
        <SummaryCard
          label="Active students"
          value={totalStudents}
          description="Students across your visible batches"
          tone="violet"
        />
      </div>

      {/* Create batch */}
      {canManage ? (
        <details className="group/create overflow-hidden rounded-3xl border border-indigo-100/80 bg-white shadow-[0_15px_45px_-32px_rgba(79,70,229,0.3)] transition-all duration-300 open:shadow-[0_20px_55px_-30px_rgba(79,70,229,0.3)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/70 px-4 py-5 transition-colors hover:from-indigo-100/70 sm:px-6 [&::-webkit-details-marker]:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 group-open/create:rotate-45">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">
                  Create a batch
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Set up a class, subject, monthly fee and teachers.
                </p>
              </div>
            </div>

            <span className="shrink-0 text-xs font-bold text-indigo-600">
              <span className="group-open/create:hidden">Add new</span>
              <span className="hidden group-open/create:inline">Close</span>
            </span>
          </summary>

          <div className="border-t border-slate-100 p-4 sm:p-6">
            <ActionForm
              action={createBatch}
              submitLabel="Create batch"
              className="space-y-4"
            >
              {fields()}

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Review the details before creating this batch.
                </p>
              </div>
            </ActionForm>
          </div>
        </details>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 3 2.8 20h18.4L12 3Z" strokeLinejoin="round" />
              <path d="M12 9v4m0 3h.01" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-bold text-amber-900">
              Batch management is disabled
            </p>
            <p className="mt-1 text-sm leading-5 text-amber-800">
              Batch management is not enabled for your account.
            </p>
          </div>
        </div>
      )}

      {/* Batch directory */}
      <section>
        <SectionHeading
          eyebrow="Class directory"
          title="Your batches"
          description="Review class details, assigned teachers, student counts and batch status."
        />

        {batches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 px-5 py-10">
            <Empty>No batches yet.</Empty>
          </div>
        ) : (
          <>
            {/* Responsive cards on small screens */}
            <div className="grid gap-4 md:hidden">
              {batches.map((b) => {
                const studentCount = n.get(String(b._id)) ?? 0;
                const teacherNames =
                  b.teacherIds
                    .map((t) => tName.get(String(t)))
                    .filter(Boolean)
                    .join(", ") || "—";

                return (
                  <article
                    key={String(b._id)}
                    className="group/card relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_45px_-28px_rgba(79,70,229,0.3)]"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-indigo-100/50 blur-2xl transition-transform duration-500 group-hover/card:scale-125"
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="16"
                                rx="3"
                              />
                              <path
                                d="M8 8h8M8 12h5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>

                          <div className="min-w-0">
                            <h3 className="break-words font-extrabold text-slate-900">
                              {b.name}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {b.className} · {b.subject}
                            </p>
                          </div>
                        </div>

                        <Badge value={b.status} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                          <p className="text-xs font-medium text-slate-500">
                            Active students
                          </p>
                          <p className="mt-1 text-xl font-extrabold text-slate-900">
                            {studentCount}
                          </p>
                        </div>

                        <div className="rounded-xl border border-indigo-100/70 bg-indigo-50/60 p-3">
                          <p className="text-xs font-medium text-slate-500">
                            Monthly fee
                          </p>
                          <p className="mt-1 break-words text-lg font-extrabold text-indigo-700">
                            {money(b.monthlyFee)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Assigned teachers
                        </p>
                        <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                          {teacherNames}
                        </p>
                      </div>

                      {canManage && (
                        <details className="group/edit mt-4 border-t border-slate-100 pt-4">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100/70 [&::-webkit-details-marker]:hidden">
                            Edit batch
                            <span className="transition-transform duration-200 group-open/edit:rotate-180">
                              ▾
                            </span>
                          </summary>

                          <div className="mt-4 space-y-4">
                            <ActionForm
                              action={updateBatch}
                              submitLabel="Save changes"
                              resetOnSuccess={false}
                              className="space-y-4"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={String(b._id)}
                              />
                              {fields(b)}
                            </ActionForm>

                            <ActionForm
                              action={setBatchActive}
                              hideSubmit
                              className="border-t border-slate-100 pt-4"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={String(b._id)}
                              />
                              <input
                                type="hidden"
                                name="active"
                                value={String(b.status !== "active")}
                              />
                              <button
                                type="submit"
                                className={cn(
                                  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4",
                                  b.status === "active"
                                    ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-200"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-200",
                                )}
                              >
                                {b.status === "active"
                                  ? "Deactivate batch"
                                  : "Activate batch"}
                              </button>
                            </ActionForm>
                          </div>
                        </details>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <TableWrap>
                <thead className="bg-gradient-to-r from-indigo-50/90 to-violet-50/70">
                  <tr>
                    <th className="th">Batch</th>
                    <th className="th">Teachers</th>
                    <th className="th">Students</th>
                    <th className="th">Monthly fee</th>
                    <th className="th">Status</th>
                    <th className="th">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {batches.map((b) => (
                    <tr
                      key={String(b._id)}
                      className="transition-colors duration-200 hover:bg-indigo-50/40"
                    >
                      <td className="td">
                        <div className="flex min-w-44 items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="16"
                                rx="3"
                              />
                              <path
                                d="M8 8h8M8 12h5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>

                          <div className="min-w-0">
                            <p className="font-bold text-slate-900">
                              {b.name}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {b.className} · {b.subject}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="td text-xs leading-5 text-slate-600">
                        {b.teacherIds
                          .map((t) => tName.get(String(t)))
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>

                      <td className="td">
                        <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-indigo-50 px-2.5 py-1.5 font-bold text-indigo-700">
                          {n.get(String(b._id)) ?? 0}
                        </span>
                      </td>

                      <td className="td font-bold text-slate-800">
                        {money(b.monthlyFee)}
                      </td>

                      <td className="td">
                        <Badge value={b.status} />
                      </td>

                      <td className="td">
                        {canManage && (
                          <details className="group/edit relative">
                            <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-bold text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 [&::-webkit-details-marker]:hidden">
                              Edit
                              <span className="transition-transform duration-200 group-open/edit:rotate-180">
                                ▾
                              </span>
                            </summary>

                            <div className="absolute right-0 top-full z-30 mt-2 max-h-[min(70vh,620px)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
                              <div className="mb-4">
                                <p className="text-sm font-extrabold text-slate-900">
                                  Edit batch
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  Update this batch&apos;s details.
                                </p>
                              </div>

                              <ActionForm
                                action={updateBatch}
                                submitLabel="Save changes"
                                resetOnSuccess={false}
                                className="space-y-4"
                              >
                                <input
                                  type="hidden"
                                  name="id"
                                  value={String(b._id)}
                                />
                                {fields(b)}
                              </ActionForm>

                              <ActionForm
                                action={setBatchActive}
                                hideSubmit
                                className="mt-4 border-t border-slate-100 pt-4"
                              >
                                <input
                                  type="hidden"
                                  name="id"
                                  value={String(b._id)}
                                />
                                <input
                                  type="hidden"
                                  name="active"
                                  value={String(b.status !== "active")}
                                />
                                <button
                                  type="submit"
                                  className={cn(
                                    "inline-flex min-h-10 w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition-colors",
                                    b.status === "active"
                                      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                                  )}
                                >
                                  {b.status === "active"
                                    ? "Deactivate batch"
                                    : "Activate batch"}
                                </button>
                              </ActionForm>
                            </div>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          </>
        )}
      </section>

      {inactiveCount > 0 && (
        <p className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs leading-5 text-slate-500">
          {inactiveCount} inactive batch{inactiveCount === 1 ? "" : "es"}{" "}
          {inactiveCount === 1 ? "is" : "are"} retained for historical records
          and can be activated again.
        </p>
      )}
    </div>
  );
}
