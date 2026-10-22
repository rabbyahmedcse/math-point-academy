import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "./icons";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex min-w-0 animate-fade-in items-center"
    >
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm sm:gap-2 sm:px-4">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-1.5 sm:gap-2"
            >
              {index === 0 && (
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                  aria-hidden="true"
                >
                  <HomeIcon className="h-4 w-4" />
                </span>
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="max-w-[140px] truncate rounded-lg px-1.5 py-1 text-xs font-semibold text-slate-500 transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-700 sm:max-w-none sm:text-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={
                    isLast
                      ? "max-w-[180px] truncate rounded-lg bg-indigo-50/80 px-2.5 py-1.5 text-xs font-extrabold text-indigo-700 sm:max-w-none sm:text-sm"
                      : "max-w-[140px] truncate px-1.5 py-1 text-xs font-medium text-slate-500 sm:max-w-none sm:text-sm"
                  }
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRightIcon
                  className="h-3.5 w-3.5 shrink-0 text-slate-300"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}