
import { Badge, Empty, TableWrap } from "@/components/ui/bits";
import { ActionForm } from "@/components/ui/ActionForm";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { formatDate, money } from "@/lib/utils";
import { User } from "@/models/User";
import { Batch } from "@/models/Batch";
import { ParentLink } from "@/models/ParentLink";
import {
  approveParentLink,
  rejectParentLink,
} from "@/actions/parent";
import { relationshipLabel } from "@/lib/relationship";
import {
  approveStudent,
  rejectStudent,
  assignBatch,
  setUserActive,
  updateStudentFee,
} from "@/actions/students";

const esc = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Pending registrations and student directory. */
export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["admin", "teacher"]);
  const sp = await searchParams;

  await connectDB();

  const isAdmin = user.role === "admin";
  const canApprove = isAdmin || user.permissions.approveStudents;

  const batches = await batchesFor(user);

  const batchName = new Map(
    (await Batch.find({}, { name: 1 }).lean()).map((b) => [
      String(b._id),
      b.name,
    ]),
  );

  const pending = canApprove
    ? await User.find({
        role: "student",
        status: "pending",
      })
        .sort({ createdAt: 1 })
        .lean()
    : [];

  // Parent link requests that need manual verification.
  const reqStudents = canApprove
    ? await User.find(
        {
          role: "student",
          status: "active",
          ...(isAdmin
            ? {}
            : {
                batchId: {
                  $in: batches.map((b) => b._id),
                },
              }),
        },
        {
          name: 1,
          studentId: 1,
          guardianPhone: 1,
        },
      ).lean()
    : [];

  const linkReqs = canApprove
    ? await ParentLink.find({
        status: "pending",
        studentId: {
          $in: reqStudents.map((s) => s._id),
        },
      })
        .sort({ createdAt: 1 })
        .lean()
    : [];

  const reqParents = new Map(
    (
      await User.find(
        {
          _id: {
            $in: linkReqs.map((l) => l.parentId),
          },
        },
        {
          name: 1,
          email: 1,
          phone: 1,
        },
      ).lean()
    ).map((u) => [String(u._id), u]),
  );

  const reqStudentMap = new Map(
    reqStudents.map((s) => [String(s._id), s]),
  );

  const filter: Record<string, unknown> = {
    role: "student",
    status: { $ne: "pending" },
  };

  if (!isAdmin) {
    filter.batchId = {
      $in: batches.map((b) => b._id),
    };
  }

  if (sp.batch) {
    filter.batchId = sp.batch;
  }

  if (sp.q) {
    const query = esc(sp.q);

    filter.$or = [
      { name: new RegExp(query, "i") },
      { studentId: new RegExp(query, "i") },
      { phone: new RegExp(query, "i") },
    ];
  }

  const students = await User.find(filter)
    .sort({ name: 1 })
    .limit(200)
    .lean();

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
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <path d="M20 8v6M17 11h6" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Student administration
            </span>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Students <span className="text-indigo-600">Management</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Review registrations, manage parent connections, assign batches
              and maintain your student directory.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Registration review
              </span>

              <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                Batch management
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Permission notice */}
      {!canApprove && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
          <p>
            The admin has not enabled registration approval for your account.
          </p>
        </div>
      )}

      {/* Pending registrations */}
      {canApprove && (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Registration review"
            title="Pending registrations"
            subtitle="Review student information before approving or rejecting an application."
            count={pending.length}
            tone="indigo"
          />

          {pending.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
              <Empty>No pending registrations.</Empty>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pending.map((s) => (
                <article
                  key={String(s._id)}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/[0.06]"
                >
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <AvatarInitial
                          name={s.name}
                          image={s.image}
                        />

                        <div className="min-w-0">
                          <h3 className="break-words font-bold text-slate-900">
                            {s.name}
                          </h3>
                          <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                            {s.studentId} · {s.className}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Registered {formatDate(s.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Badge value="pending" />
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <ContactItem label="Email" value={s.email || "—"} />
                      <ContactItem label="Phone" value={s.phone || "—"} />
                      <ContactItem
                        label="Guardian"
                        value={s.guardianName || "—"}
                      />
                      <ContactItem
                        label="Guardian phone"
                        value={s.guardianPhone || "—"}
                      />

                      {s.address && (
                        <div className="sm:col-span-2">
                          <ContactItem label="Address" value={s.address} />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 sm:p-4">
                      <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                        Approve registration
                      </p>

                      <ActionForm
                        action={approveStudent}
                        submitLabel="Approve & assign"
                        resetOnSuccess={false}
                        className="flex flex-col gap-3 sm:flex-row sm:items-end"
                      >
                        <input
                          type="hidden"
                          name="studentId"
                          value={String(s._id)}
                        />

                        <label className="block min-w-0 flex-1">
                          <span className="label">Assign to batch</span>
                          <select
                            name="batchId"
                            required
                            defaultValue=""
                            className="input"
                          >
                            <option value="" disabled>
                              Select batch...
                            </option>
                            {batches.map((b) => (
                              <option
                                key={String(b._id)}
                                value={String(b._id)}
                              >
                                {b.name} — {b.className}
                              </option>
                            ))}
                          </select>
                        </label>
                      </ActionForm>
                    </div>

                    <details className="group/reject mt-3">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 [&::-webkit-details-marker]:hidden">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          className="h-4 w-4 transition-transform group-open/reject:rotate-45"
                          aria-hidden="true"
                        >
                          <path d="M10 4v12M4 10h12" />
                        </svg>
                        Reject registration
                      </summary>

                      <div className="mt-2 rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                        <ActionForm
                          action={rejectStudent}
                          submitLabel="Reject registration"
                          submitClassName="btn btn-danger btn-sm"
                          resetOnSuccess={false}
                          className="space-y-2"
                        >
                          <input
                            type="hidden"
                            name="studentId"
                            value={String(s._id)}
                          />
                          <input
                            name="reason"
                            className="input"
                            placeholder="Reason (optional)"
                          />
                        </ActionForm>
                      </div>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Parent link requests */}
      {canApprove && linkReqs.length > 0 && (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Family connections"
            title="Parent link requests"
            subtitle="Verify the parent's identity before granting access to a student's information."
            count={linkReqs.length}
            tone="violet"
          />

          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs leading-5 text-amber-900 sm:text-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <path d="M12 3 2.8 20h18.4L12 3Z" />
              <path d="M12 9v4M12 16h.01" />
            </svg>
            <p>
              The parent's mobile number did not match the guardian number
              saved at student registration. Approve only if you recognize
              the parent.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {linkReqs.map((l) => {
              const par = reqParents.get(String(l.parentId));
              const stu = reqStudentMap.get(String(l.studentId));

              return (
                <article
                  key={String(l._id)}
                  className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/[0.05] sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
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
                        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="10" cy="7" r="4" />
                        <path d="M20 8v6M17 11h6" />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-bold text-slate-900">
                        {par?.name || "Unknown parent"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {relationshipLabel(l.relationship)}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      Pending
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <ContactItem
                      label="Parent email"
                      value={par?.email || "—"}
                    />
                    <ContactItem
                      label="Parent phone"
                      value={par?.phone || "—"}
                    />
                  </div>

                  <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">
                      Student requested
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <AvatarInitial
                        name={stu?.name}
                        image={stu?.image}
                      />
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold text-slate-900">
                          {stu?.name || "Unknown student"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Student ID: {stu?.studentId || "—"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-600">
                      Guardian phone on record:{" "}
                      <span className="font-semibold text-slate-800">
                        {stu?.guardianPhone || "—"}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                    <ActionForm
                      action={approveParentLink}
                      submitLabel="Approve"
                      resetOnSuccess={false}
                      className="shrink-0"
                    >
                      <input
                        type="hidden"
                        name="linkId"
                        value={String(l._id)}
                      />
                    </ActionForm>

                    <div className="min-w-0 flex-1">
                      <ActionForm
                        action={rejectParentLink}
                        submitLabel="Reject"
                        submitClassName="btn btn-danger"
                        resetOnSuccess={false}
                        className="space-y-2"
                      >
                        <input
                          type="hidden"
                          name="linkId"
                          value={String(l._id)}
                        />
                        <input
                          name="reason"
                          placeholder="Reason (optional)"
                          className="input"
                        />
                      </ActionForm>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Student directory */}
      <section className="min-w-0 space-y-4">
        <SectionHeading
          eyebrow="Student directory"
          title="All students"
          subtitle="Search student records and manage their batch, fees and account status."
          count={students.length}
          tone="indigo"
        />

        {/* Search and filters */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(180px,0.65fr)_auto]">
            <label className="block min-w-0">
              <span className="label">Search students</span>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
                <input
                  name="q"
                  defaultValue={sp.q}
                  placeholder="Name, ID or phone..."
                  className="input pl-9"
                />
              </div>
            </label>

            <label className="block min-w-0">
              <span className="label">Filter by batch</span>
              <select
                name="batch"
                defaultValue={sp.batch ?? ""}
                className="input"
              >
                <option value="">All batches</option>
                {batches.map((b) => (
                  <option key={String(b._id)} value={String(b._id)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 sm:w-auto">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M4 5h16M7 12h10m-7 7h4" />
                </svg>
                Apply filters
              </button>

              {(sp.q || sp.batch) && (
                <a
                  href="?"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Clear
                </a>
              )}
            </div>
          </form>
        </div>

        {students.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <Empty>No students found.</Empty>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-md">
            <TableWrap>
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="th">Student</th>
                  <th className="th">Class / Batch</th>
                  <th className="th">Contact</th>
                  <th className="th">Status</th>
                  <th className="th">Manage</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr
                    key={String(s._id)}
                    className="group transition-colors duration-200 hover:bg-indigo-50/40"
                  >
                    <td className="td min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <AvatarInitial
                          name={s.name}
                          image={s.image}
                        />
                        <div className="min-w-0">
                          <p className="break-words font-bold text-slate-800">
                            {s.name}
                          </p>
                          <p className="mt-0.5 break-all text-xs text-slate-500">
                            {s.studentId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="td min-w-[145px]">
                      <p className="font-semibold text-slate-800">
                        {s.className}
                      </p>
                      <p className="mt-1 break-words text-xs text-slate-500">
                        {s.batchId
                          ? batchName.get(String(s.batchId)) || "—"
                          : "—"}
                      </p>
                    </td>

                    <td className="td min-w-[160px] text-xs">
                      <p className="break-words font-medium text-slate-700">
                        {s.phone || "—"}
                      </p>
                      <p className="mt-1 break-words text-slate-500">
                        Guardian: {s.guardianPhone || "—"}
                      </p>
                    </td>

                    <td className="td min-w-[105px]">
                      <Badge value={s.status} />
                    </td>

                    <td className="td min-w-[105px]">
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

                        <div className="mt-2 w-[min(18rem,calc(100vw-3rem))] space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:w-72">
                          {canApprove && s.status === "active" && (
                            <div>
                              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                                Batch assignment
                              </p>

                              <ActionForm
                                action={assignBatch}
                                submitLabel="Move batch"
                                submitClassName="btn btn-secondary btn-sm"
                                resetOnSuccess={false}
                                className="space-y-2"
                              >
                                <input
                                  type="hidden"
                                  name="studentId"
                                  value={String(s._id)}
                                />
                                <select
                                  name="batchId"
                                  defaultValue={String(s.batchId ?? "")}
                                  className="input"
                                >
                                  {batches.map((b) => (
                                    <option
                                      key={String(b._id)}
                                      value={String(b._id)}
                                    >
                                      {b.name}
                                    </option>
                                  ))}
                                </select>
                              </ActionForm>
                            </div>
                          )}

                          {isAdmin && (
                            <>
                              <div className="border-t border-slate-100 pt-3">
                                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-violet-600">
                                  Monthly fee
                                </p>

                                <ActionForm
                                  action={updateStudentFee}
                                  submitLabel="Save fee"
                                  submitClassName="btn btn-secondary btn-sm"
                                  resetOnSuccess={false}
                                  className="space-y-2"
                                >
                                  <input
                                    type="hidden"
                                    name="id"
                                    value={String(s._id)}
                                  />
                                  <input
                                    name="monthlyFee"
                                    type="number"
                                    min={0}
                                    defaultValue={s.monthlyFee ?? ""}
                                    placeholder="Batch default"
                                    className="input"
                                  />
                                </ActionForm>
                              </div>

                              {(s.status === "active" ||
                                s.status === "inactive") && (
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
                                      value={String(s._id)}
                                    />
                                    <input
                                      type="hidden"
                                      name="active"
                                      value={String(s.status !== "active")}
                                    />
                                    <button
                                      className={
                                        s.status === "active"
                                          ? "btn btn-danger btn-sm w-full"
                                          : "btn btn-primary btn-sm w-full"
                                      }
                                    >
                                      {s.status === "active"
                                        ? "Deactivate student"
                                        : "Activate student"}
                                    </button>
                                  </ActionForm>
                                </div>
                              )}
                            </>
                          )}

                          {s.monthlyFee != null && (
                            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                              Custom fee:{" "}
                              <span className="font-bold text-slate-700">
                                {money(s.monthlyFee)}
                              </span>
                            </p>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}

        <p className="px-1 text-xs text-slate-400">
          Showing up to 200 matching student records.
        </p>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  count,
  tone,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  count: number;
  tone: "indigo" | "violet";
}) {
  const styles =
    tone === "indigo"
      ? {
          bar: "bg-indigo-500",
          eyebrow: "text-indigo-600",
          badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
          dot: "bg-indigo-500",
        }
      : {
          bar: "bg-violet-500",
          eyebrow: "text-violet-600",
          badge: "border-violet-100 bg-violet-50 text-violet-700",
          dot: "bg-violet-500",
        };

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 px-1">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`mt-1 h-9 w-1 shrink-0 rounded-full ${styles.bar}`}
        />
        <div className="min-w-0">
          <p
            className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${styles.eyebrow}`}
          >
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <span
        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${styles.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
        {count} {count === 1 ? "record" : "records"}
      </span>
    </div>
  );
}

function AvatarInitial({
  name,
  image,
}: {
  name?: string | null;
  image?: string | null;
}) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const imageUrl = image?.trim();

  // PhotoImage (client) converts Google Drive links and falls back by rendering nothing,
  // so the initial letter behind it stays visible when the image is missing or cannot load.
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-black text-indigo-700 ring-1 ring-indigo-100/80 sm:h-12 sm:w-12">
      <span className="absolute inset-0 flex items-center justify-center">
        {initial}
      </span>
      {imageUrl ? (
        <PhotoImage
          src={imageUrl}
          alt={`${name || "Student"} profile`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </span>
  );
}

function ContactItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-xs font-medium leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}
