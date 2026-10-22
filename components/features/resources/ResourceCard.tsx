
"use client";

import {
  memo,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cn, formatDate } from "@/lib/utils";
import {
  KIND_LABEL,
  isSafeHttpUrl,
  type ResourceItem,
  type ResourceKind,
  type ResourceStatus,
} from "@/lib/resources";
import {
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayersIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from "@/components/ui/icons";

const KIND_ICON: Record<ResourceKind, typeof FileTextIcon> = {
  homework: FileTextIcon,
  quiz: HelpCircleIcon,
  material: FileTextIcon,
};

export function ResourceStatusBadge({
  status,
}: {
  status: ResourceStatus;
}) {
  const scheduled = status === "scheduled";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
        "transition-colors duration-200",
        scheduled
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          scheduled ? "bg-indigo-500" : "bg-emerald-500",
        )}
      />
      {scheduled ? "Scheduled" : "Published"}
    </span>
  );
}

/** Three-dot menu with keyboard navigation, click-away close and focus restoration. */
function ResourceActionMenu({
  item,
  canManage,
  detailsOpen,
  onToggleDetails,
  onEdit,
  onDelete,
}: {
  item: ResourceItem;
  canManage: boolean;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);

  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const hasUrl = isSafeHttpUrl(item.url);

  useEffect(() => {
    if (!open) return;

    const away = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", away);

    wrap.current
      ?.querySelector<HTMLElement>('[role="menuitem"]')
      ?.focus();

    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  useEffect(() => {
    if (!copied) return;

    const t = setTimeout(() => setCopied(null), 1800);

    return () => clearTimeout(t);
  }, [copied]);

  const close = (refocus = true) => {
    setOpen(false);

    if (refocus) {
      trigger.current?.focus();
    }
  };

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const items = [
      ...(wrap.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]',
      ) ?? []),
    ];

    const i = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  }

  const itemCls =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:bg-indigo-50 focus-visible:text-indigo-700";

  return (
    <div ref={wrap} onKeyDown={onKeyDown} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-label={`More actions for ${item.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200",
          open
            ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-md"
            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700",
        )}
      >
        <MoreVerticalIcon
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`Actions for ${item.title}`}
          className="absolute right-0 top-full z-30 mt-2 w-56 origin-top-right animate-[resourceMenuIn_160ms_ease-out] rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_16px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl"
        >
          <div className="mb-1 border-b border-slate-100 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Resource actions
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
              {item.title}
            </p>
          </div>

          {hasUrl && (
            <a
              role="menuitem"
              tabIndex={-1}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => close(false)}
              className={itemCls}
            >
              <ExternalLinkIcon className="h-4 w-4 text-slate-500" />
              Open in new tab
            </a>
          )}

          {hasUrl && (
            <button
              role="menuitem"
              tabIndex={-1}
              type="button"
              onClick={copy}
              className={itemCls}
            >
              {copied === "ok" ? (
                <CheckIcon className="h-4 w-4 text-emerald-600" />
              ) : (
                <CopyIcon className="h-4 w-4 text-slate-500" />
              )}

              <span className="flex-1">
                {copied === "ok"
                  ? "Link copied"
                  : copied === "fail"
                    ? "Couldn’t copy"
                    : "Copy link"}
              </span>

              {copied === "ok" && (
                <span className="text-[10px] font-bold text-emerald-600">
                  DONE
                </span>
              )}
            </button>
          )}

          <button
            role="menuitem"
            tabIndex={-1}
            type="button"
            onClick={() => {
              onToggleDetails();
              close();
            }}
            className={itemCls}
          >
            <FileTextIcon className="h-4 w-4 text-slate-500" />
            {detailsOpen ? "Hide details" : "View details"}
          </button>

          {canManage && (
            <>
              <div
                role="separator"
                className="my-1 h-px bg-slate-100"
              />

              <button
                role="menuitem"
                tabIndex={-1}
                type="button"
                onClick={() => {
                  close(false);
                  onEdit();
                }}
                className={itemCls}
              >
                <PencilIcon className="h-4 w-4 text-slate-500" />
                Edit resource
              </button>

              <button
                role="menuitem"
                tabIndex={-1}
                type="button"
                onClick={() => {
                  close(false);
                  onDelete();
                }}
                className={cn(
                  itemCls,
                  "text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:bg-rose-50 focus-visible:text-rose-700",
                )}
              >
                <TrashIcon className="h-4 w-4" />
                Delete resource
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes resourceMenuIn {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div,
          button {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function ResourceCardBase({
  item,
  canManage,
  showBatch,
  onEdit,
  onDelete,
}: {
  item: ResourceItem;
  canManage: boolean;
  showBatch: boolean;
  onEdit: (i: ResourceItem) => void;
  onDelete: (i: ResourceItem) => void;
}) {
  const [details, setDetails] = useState(false);

  const Icon = KIND_ICON[item.kind];
  const hasUrl = isSafeHttpUrl(item.url);

  return (
    <li className="group relative isolate overflow-visible">
      {/* Card glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-indigo-200/50 via-transparent to-violet-200/50 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
      />

      <div
        className={cn(
          "relative overflow-visible rounded-3xl border border-slate-200/80 bg-white",
          "p-4 shadow-[0_4px_20px_rgba(15,23,42,0.035)]",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-0.5 hover:border-indigo-200/90 hover:shadow-[0_16px_40px_rgba(79,70,229,0.09)]",
          "sm:p-6",
        )}
      >
        {/* Top accent */}
        <div
          aria-hidden="true"
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Resource information */}
          <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
            <span
              aria-hidden="true"
              className="group/icon relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50 to-violet-100/80 text-indigo-600 shadow-sm shadow-indigo-500/5 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 group-hover:shadow-md group-hover:shadow-indigo-500/10 sm:h-16 sm:w-16"
            >
              <span className="absolute inset-0 rounded-2xl bg-white/20" />
              <Icon className="relative h-7 w-7 transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8" />
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="break-words text-base font-extrabold leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-indigo-950 sm:text-xl">
                {item.title}
              </h3>

              {/* Badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <ResourceStatusBadge status={item.status} />

                <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {KIND_LABEL[item.kind]}
                </span>

                {showBatch && item.batchName && (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    <LayersIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.batchName}</span>
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                  </span>
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                </span>

                {item.createdByName && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                      <UserIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="max-w-[180px] truncate">
                      {item.createdByName}
                    </span>
                  </span>
                )}
              </div>

              {item.description && !details && (
                <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 border-t border-slate-100 pt-4 sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            {hasUrl ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group/open relative inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-3 text-sm font-bold text-white sm:flex-none sm:px-4",
                  "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20",
                  "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/60",
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover/open:translate-x-full"
                />

                <DownloadIcon className="relative h-5 w-5 shrink-0 transition-transform duration-300 group-hover/open:-translate-y-0.5" />

                <span className="relative whitespace-nowrap">
                  Open / download
                </span>

                <span className="sr-only">
                  {" "}
                  {item.title} (opens in a new tab)
                </span>
              </a>
            ) : (
              <span
                aria-disabled="true"
                title="No link or file has been attached to this resource"
                className="inline-flex h-12 min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-400 sm:flex-none sm:px-4"
              >
                <FileTextIcon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">No file attached</span>
              </span>
            )}

            <ResourceActionMenu
              item={item}
              canManage={canManage}
              detailsOpen={details}
              onToggleDetails={() => setDetails((d) => !d)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          </div>
        </div>

        {/* Expanded details */}
        {details && (
          <dl className="mt-5 grid animate-[resourceDetailsIn_220ms_ease-out] gap-x-6 gap-y-4 rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-4 sm:grid-cols-2 sm:p-5">
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Description
              </dt>
              <dd className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700">
                {item.description || "No description provided."}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Type
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-700">
                {KIND_LABEL[item.kind]}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {item.status === "scheduled" ? "Scheduled for" : "Date"}
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-700">
                {formatDate(item.date)}
              </dd>
            </div>

            {item.batchName && (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Batch
                </dt>
                <dd className="mt-1.5 break-words text-sm font-semibold text-slate-700">
                  {item.batchName}
                </dd>
              </div>
            )}

            {item.createdByName && (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Shared by
                </dt>
                <dd className="mt-1.5 break-words text-sm font-semibold text-slate-700">
                  {item.createdByName}
                </dd>
              </div>
            )}

            {hasUrl && (
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Resource link
                </dt>
                <dd className="mt-1.5 break-all rounded-xl border border-indigo-100 bg-white/80 p-3 text-sm text-indigo-700">
                  {item.url}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      <style jsx>{`
        @keyframes resourceDetailsIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div,
          span,
          a,
          button {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </li>
  );
}

export const ResourceCard = memo(ResourceCardBase);
