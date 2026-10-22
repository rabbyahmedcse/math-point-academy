
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/components/ui/icons";

type NoticeItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

type Payload = {
  items: NoticeItem[];
  unreadCount: number;
};

export function NotificationBell({ href }: { href: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = (await response.json()) as Payload;

      setItems(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(
        Number.isFinite(data.unreadCount) ? data.unreadCount : 0,
      );
      setError("");
    } catch {
      setError("নোটিফিকেশন লোড করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and automatic refresh every 60 seconds.
  useEffect(() => {
    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [refresh]);

  // Close dropdown on outside click or Escape.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function markRead(id: string) {
    const notice = items.find((item) => item.id === id);

    if (!notice || notice.read || busy !== null) return;

    setBusy(id);
    setError("");

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      setError("নোটিফিকেশনটি read করা যায়নি। আবার চেষ্টা করো।");
      throw new Error("Unable to mark notification as read");
    } finally {
      setBusy(null);
    }
  }

  async function markAllRead() {
    if (busy !== null || unreadCount === 0) return;

    setBusy("all");
    setError("");

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }

      setItems((current) =>
        current.map((item) => ({ ...item, read: true })),
      );

      setUnreadCount(0);
    } catch {
      setError("সব নোটিফিকেশন read করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setBusy(null);
    }
  }

  async function openNotice(item: NoticeItem) {
    if (busy !== null) return;

    if (!item.read) {
      try {
        await markRead(item.id);
      } catch {
        return;
      }
    }

    setOpen(false);
    router.push(item.href || href);
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("bn-BD", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return (
    <div className="relative" ref={rootRef}>
      {/* Notification button */}
      <button
        type="button"
        aria-label={`নোটিফিকেশন${
          unreadCount > 0 ? `, ${unreadCount}টি অপঠিত` : ""
        }`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen((previous) => !previous);

          if (!open) {
            void refresh();
          }
        }}
        className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 text-indigo-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:h-11 sm:w-11 sm:rounded-2xl"
      >
        <BellIcon className="h-5 w-5 transition-transform duration-200 group-hover:rotate-[-8deg]" />

        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Responsive notification dropdown */}
      {open && (
        <section
          role="dialog"
          aria-label="নোটিফিকেশন তালিকা"
          className="fixed left-3 right-3 top-[4.75rem] z-50 mx-auto flex max-h-[calc(100dvh-6rem)] w-auto max-w-md flex-col overflow-hidden rounded-2xl border border-indigo-100/80 bg-white shadow-[0_20px_70px_rgba(49,46,129,0.20)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-[min(34rem,calc(100dvh-6rem))] sm:w-[min(24rem,calc(100vw-2rem))] sm:rounded-3xl"
        >
          {/* Gradient header */}
          <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-4 py-4 text-white sm:px-5 sm:py-5">
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl"
            />

            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-bold sm:text-lg">
                  নোটিফিকেশন
                </h2>

                <p className="mt-1 text-xs text-indigo-100">
                  {unreadCount > 0
                    ? `${unreadCount}টি নোটিফিকেশন পড়া বাকি`
                    : "সব নোটিফিকেশন পড়ে ফেলেছো"}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur sm:h-11 sm:w-11 sm:rounded-2xl">
                <BellIcon className="h-5 w-5" />
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void markAllRead()}
                className="relative mt-3 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-4"
              >
                {busy === "all"
                  ? "অপেক্ষা করো..."
                  : "সবগুলো পড়া হয়েছে"}
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {error && (
              <div
                role="alert"
                className="m-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
              >
                {error}
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="ml-2 font-bold underline"
                >
                  আবার চেষ্টা
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3 p-3 sm:p-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse gap-3 rounded-2xl p-2 sm:p-3"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-100 sm:h-10 sm:w-10" />

                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-3/4 rounded bg-slate-200" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-2 w-1/3 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center sm:px-5 sm:py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 sm:h-14 sm:w-14">
                  <BellIcon className="h-6 w-6" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-800">
                  কোনো নোটিফিকেশন নেই
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  নতুন নোটিফিকেশন এলে এখানে দেখতে পাবে।
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 transition-colors hover:bg-indigo-50/50 sm:p-4 ${
                      item.read ? "bg-white" : "bg-indigo-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
                          item.read
                            ? "bg-slate-100 text-slate-500"
                            : "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm"
                        }`}
                      >
                        <BellIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => void openNotice(item)}
                          disabled={busy !== null}
                          className="block w-full text-left disabled:cursor-wait"
                        >
                          <span
                            className={`block break-words text-sm ${
                              item.read
                                ? "font-medium text-slate-700"
                                : "font-bold text-slate-900"
                            }`}
                          >
                            {item.title}
                          </span>

                          <span className="mt-1 line-clamp-2 block whitespace-pre-line break-words text-xs leading-5 text-slate-600">
                            {item.body}
                          </span>

                          <time
                            dateTime={item.createdAt}
                            className="mt-2 block text-[10px] leading-4 text-slate-400 sm:text-[11px]"
                          >
                            {formatDate(item.createdAt)}
                          </time>
                        </button>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
                          {!item.read ? (
                            <button
                              type="button"
                              disabled={busy !== null}
                              onClick={() => void markRead(item.id)}
                              className="min-h-8 rounded-lg px-1 text-left text-[11px] font-semibold text-indigo-600 transition hover:text-violet-700 disabled:opacity-50 sm:min-h-0"
                            >
                              {busy === item.id
                                ? "অপেক্ষা করো..."
                                : "পড়ে ফেলেছি"}
                            </button>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-600">
                              ✓ পড়া হয়েছে
                            </span>
                          )}

                          <Link
                            href={item.href || href}
                            onClick={() => setOpen(false)}
                            className="rounded-lg px-1 py-1 text-[11px] font-semibold text-slate-500 transition hover:text-indigo-600"
                          >
                            দেখুন →
                          </Link>
                        </div>
                      </div>

                      {!item.read && (
                        <span
                          aria-label="অপঠিত"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer link */}
          <Link
            href={href}
            onClick={() => setOpen(false)}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 border-t border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-3 text-center text-xs font-bold text-indigo-700 transition hover:from-indigo-100 hover:to-violet-100 sm:px-4 sm:py-3.5 sm:text-sm"
          >
            সব নোটিফিকেশন দেখুন
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}
    </div>
  );
}
