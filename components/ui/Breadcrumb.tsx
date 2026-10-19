import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "./icons";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-1.5">
          {i === 0 && <HomeIcon className="h-4 w-4" />}
          {it.href ? <Link href={it.href} className="hover:text-indigo-600">{it.label}</Link> : <span className="font-medium text-indigo-600">{it.label}</span>}
          {i < items.length - 1 && <ChevronRightIcon className="h-3.5 w-3.5" />}
        </span>
      ))}
    </nav>
  );
}
