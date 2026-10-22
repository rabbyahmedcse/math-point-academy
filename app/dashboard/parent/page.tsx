
import Link from "next/link";
import { PageHeader, StatCard, Empty } from "@/components/ui/bits";
import { Avatar } from "@/components/features/parent/ChildPicker";
import { requireRole } from "@/lib/session";
import { childSnapshot, pendingLinkCount, resolveChild } from "@/lib/parent-data";
import { relationshipLabel } from "@/lib/relationship";
import { cn, money } from "@/lib/utils";

export default async function MyChildren({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole(["parent"]);
  const sp = await searchParams;
  const [{ children, child }, pending] = await Promise.all([
    resolveChild(user.id, sp.child),
    pendingLinkCount(user.id),
  ]);
  const snap = child ? await childSnapshot(child) : null;
  const q = (p: string) => `${p}?child=${child?.id}`;

  return (
    <div className="relative isolate space-y-6 pb-8">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-80 -z-10 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl"
      />

      {/* Page header */}
      <section className="rounded-3xl border border-white/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 p-5 shadow-lg shadow-indigo-950/[0.04] sm:p-7">
        <PageHeader
          title="My Children"
          subtitle={`Welcome, ${user.name}. Children registered with your mobile number are added automatically.`}
        />

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Parent Dashboard
        </div>
      </section>

      {/* Pending link requests */}
      {pending > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-orange-50/70 p-4 shadow-sm sm:p-5">
          <div
            aria-hidden
            className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500"
          />
          <div className="flex items-start gap-3 pl-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl shadow-sm">
              ⏳
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-amber-950">
                Pending Child Verification
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                {pending} child link request{pending > 1 ? "s are" : " is"}{" "}
                waiting for a teacher or admin to verify. It will appear here
                once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Children list */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Registered Children
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a child to view their academic information.
          </p>
        </div>

        {children.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl shadow-inner">
              🎓
            </div>
            <Empty>
              No verified child yet. Children registered with your mobile
              number appear here automatically once they are approved.
            </Empty>
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {children.map((c) => {
              const selected = c.id === child?.id;

              return (
                <Link
                  key={c.id}
                  href={`?child=${c.id}`}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "group relative flex min-w-0 items-center gap-4 overflow-hidden rounded-3xl border bg-white/90 p-4 shadow-md shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5",
                    selected
                      ? "border-indigo-300 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 ring-2 ring-indigo-500/70 shadow-indigo-500/10"
                      : "border-slate-200/80 hover:border-indigo-200 hover:shadow-indigo-500/10"
                  )}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-200/20 blur-2xl transition-colors duration-300 group-hover:bg-indigo-300/30"
                  />

                  <div
                    className={cn(
                      "relative shrink-0 rounded-2xl p-0.5 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105",
                      selected
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20"
                        : "bg-gradient-to-br from-slate-200 to-indigo-100"
                    )}
                  >
                    <Avatar
                      name={c.name}
                      image={c.image}
                      size="h-16 w-16 rounded-2xl text-2xl ring-2 ring-white"
                    />
                  </div>

                  <div className="relative min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-extrabold text-slate-900 transition-colors group-hover:text-indigo-700">
                        {c.name}
                      </p>

                      {selected && (
                        <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                          Selected
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate font-mono text-xs text-slate-500">
                      {c.studentId}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-600">
                      {c.className} · {c.batchName}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:translate-x-0.5",
                      selected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Selected child details */}
      {child && snap && (
        <section className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-950/[0.04]">
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-5 text-white sm:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 right-28 h-36 w-36 rounded-full bg-violet-400/30 blur-2xl"
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="shrink-0 rounded-2xl bg-white/15 p-1 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                  <Avatar
                    name={child.name}
                    image={child.image}
                    size="h-16 w-16 rounded-xl text-2xl ring-2 ring-white/30"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">
                    Selected Student
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {child.name}
                  </h2>
                  <p className="mt-1 text-sm text-indigo-100">
                    {child.studentId} · {child.className} · {child.batchName}
                  </p>
                </div>

                <div className="sm:ml-auto sm:text-right">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                    {relationshipLabel(child.relationship)}
                  </span>
                  <p className="mt-2 text-xs text-indigo-100">
                    Your relationship
                  </p>
                </div>
              </div>
            </div>

            {/* Student details */}
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
              {[
                { label: "Student ID", value: child.studentId },
                { label: "Class", value: child.className },
                { label: "Batch", value: child.batchName },
                {
                  label: "Relationship",
                  value: relationshipLabel(child.relationship),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md"
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "mt-2 break-words text-sm font-bold text-slate-800",
                      item.label === "Student ID" && "font-mono"
                    )}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic overview */}
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
              Academic Overview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              A quick look at attendance, fees and the latest result.
            </p>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white p-1 shadow-md shadow-emerald-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
              <StatCard
                label="Attendance"
                value={`${snap.att.percent}%`}
                hint={`${snap.att.attended} of ${snap.att.total} classes`}
                tone={snap.att.total && snap.att.percent < 75 ? "red" : "green"}
              />
              <div className="px-4 pb-4">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Attendance rate</span>
                  <span>{snap.att.percent}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100 shadow-inner"
                  role="progressbar"
                  aria-label="Attendance rate"
                  aria-valuenow={snap.att.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      snap.att.total && snap.att.percent < 75
                        ? "bg-gradient-to-r from-rose-400 to-red-500"
                        : "bg-gradient-to-r from-emerald-400 to-teal-500"
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, snap.att.percent))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="group rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-white p-1 shadow-md shadow-rose-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10">
              <StatCard
                label="Total due"
                value={money(snap.due)}
                tone={snap.due ? "red" : "green"}
              />
              <div className="px-4 pb-4">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                    snap.due
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {snap.due ? "Payment due" : "All settled"}
                </span>
              </div>
            </div>

            <div className="group rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-white p-1 shadow-md shadow-indigo-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 sm:col-span-2 xl:col-span-1">
              <StatCard
                label="Latest result"
                value={
                  snap.latest
                    ? `${snap.latest.marks}/${snap.latest.full}`
                    : "—"
                }
                hint={
                  snap.latest
                    ? `${snap.latest.name} · ${snap.latest.subject}`
                    : "No published result"
                }
                tone="indigo"
              />
              <div className="px-4 pb-4">
                <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  Latest exam performance
                </span>
              </div>
            </div>
          </div>

          {/* Quick navigation */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-slate-950/[0.03] sm:p-6">
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Quick Access
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Open your child&apos;s detailed academic records.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Attendance",
                  href: q("/dashboard/parent/attendance"),
                  icon: "📊",
                  color:
                    "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                },
                {
                  label: "Routine & Notice",
                  href: q("/dashboard/parent/routine"),
                  icon: "📅",
                  color:
                    "border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100",
                },
                {
                  label: "Monthly Fee",
                  href: q("/dashboard/parent/fees"),
                  icon: "💳",
                  color:
                    "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100",
                },
                {
                  label: "Exam Results",
                  href: q("/dashboard/parent/results"),
                  icon: "🎓",
                  color:
                    "border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "group/link flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200",
                    item.color
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-lg shadow-sm transition-transform duration-300 group-hover/link:rotate-[-5deg] group-hover/link:scale-105">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/link:translate-x-1"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
