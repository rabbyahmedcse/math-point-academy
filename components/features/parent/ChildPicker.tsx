
import Link from "next/link";
import { cn } from "@/lib/utils";
import { pendingLinkCount, type Child } from "@/lib/parent-data";
import { PageHeader, Empty } from "@/components/ui/bits";
import { Avatar } from "@/components/ui/Avatar";

export { Avatar };

/** Pill switcher shown on every parent page when the parent has more than one child. */
export function ChildPicker({
  kids,
  selectedId,
  basePath,
}: {
  kids: Child[];
  selectedId: string;
  basePath: string;
}) {
  if (kids.length < 2) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <circle cx="9" cy="8" r="3.5" />
            <path
              d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h3a4.5 4.5 0 0 1 4.5 4.5V20"
              strokeLinecap="round"
            />
            <path
              d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.5a4.5 4.5 0 0 1 3 4.25V20"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Switch child
          </h3>
          <p className="text-xs text-slate-500">
            Select a child to view their academic information.
          </p>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2.5"
        role="tablist"
        aria-label="Choose child"
      >
        {kids.map((c) => {
          const isSelected = c.id === selectedId;

          return (
            <Link
              key={c.id}
              href={`${basePath}?child=${c.id}`}
              role="tab"
              aria-selected={isSelected}
              aria-current={isSelected ? "page" : undefined}
              className={cn(
                "group relative inline-flex min-h-12 items-center gap-2.5 overflow-hidden rounded-2xl border py-1.5 pl-1.5 pr-4",
                "text-sm font-semibold transition-all duration-300 ease-out",
                "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20",
                isSelected
                  ? "border-indigo-600 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                  : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-700 hover:shadow-md",
              )}
            >
              <span
                className={cn(
                  "shrink-0 rounded-full ring-2 transition-all duration-300",
                  isSelected
                    ? "ring-white/50"
                    : "ring-slate-100 group-hover:ring-indigo-200",
                )}
              >
                <Avatar
                  name={c.name}
                  image={c.image}
                  size="h-9 w-9 text-sm"
                />
              </span>

              <span className="max-w-[180px] truncate">{c.name}</span>

              {isSelected && (
                <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      d="m5 10 3 3 7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Shown on every parent page until at least one child is verified. */
export async function NoChild({ parentId }: { parentId: string }) {
  const pending = await pendingLinkCount(parentId);

  return (
    <div className="space-y-5">
      <PageHeader title="No verified child yet" />

      <section className="relative isolate overflow-hidden rounded-3xl border border-indigo-100/80 bg-white shadow-[0_20px_60px_-35px_rgba(79,70,229,0.3)]">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-56 w-56 rounded-full bg-violet-100/50 blur-3xl"
        />

        <div className="px-5 py-9 sm:px-8 sm:py-12">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            {/* Illustration */}
            <div className="relative mb-6">
              <div className="absolute inset-0 scale-125 rounded-full bg-indigo-100/70 blur-xl" />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-100 shadow-lg shadow-indigo-500/10 transition-transform duration-500 hover:-translate-y-1 hover:rotate-2">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  className="h-14 w-14 text-indigo-600"
                  aria-hidden="true"
                >
                  <circle
                    cx="32"
                    cy="20"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M13 53v-5a19 19 0 0 1 38 0v5H13Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="48"
                    cy="13"
                    r="9"
                    fill="#E0E7FF"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M48 9v8m-4-4h8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-100 text-amber-700 shadow-sm">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="10" cy="10" r="7" />
                  <path
                    d="M10 6v4l2.5 1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <span
              className={cn(
                "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
                pending > 0
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-indigo-100 bg-indigo-50 text-indigo-700",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  pending > 0 ? "bg-amber-500" : "bg-indigo-500",
                )}
              />
              <span className="text-xs font-bold">
                {pending > 0 ? "Verification pending" : "No linked child"}
              </span>
            </span>

            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              {pending > 0
                ? "Your request is under review"
                : "Let's connect your child's account"}
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
              {pending > 0
                ? "Your request is waiting for a teacher or admin to verify it. Your child's information will appear here after approval."
                : "No child is linked to your account yet. Children whose guardian mobile matches your number appear here automatically once approved — otherwise please contact the coaching center."}
            </p>

            {pending > 0 && (
              <div className="mt-6 flex w-full max-w-sm items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-left">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 8v4m0 4h.01"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>

                <div>
                  <p className="text-sm font-bold text-amber-900">
                    What happens next?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Your teacher or administrator will review the request.
                    Once it is approved, your child's information will become
                    available here.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="M10 2.5 3.5 5v4.5c0 4 2.8 6.6 6.5 8 3.7-1.4 6.5-4 6.5-8V5L10 2.5Z"
                  strokeLinejoin="round"
                />
                <path
                  d="m7.5 10 1.7 1.7 3.5-3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Your account information remains secure.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
