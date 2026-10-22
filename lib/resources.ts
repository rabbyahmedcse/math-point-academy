/**
 * Pure helpers for the Homework & Materials feature (no database / framework imports, so they are
 * shared by server pages and client components and are unit-tested in tests/resources.test.ts).
 */

export const RESOURCE_KINDS = ["homework", "quiz", "material"] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];
export type ResourceStatus = "published" | "scheduled";
export type KindFilter = "all" | ResourceKind;
export type SortOrder = "latest" | "oldest";

export const KIND_LABEL: Record<ResourceKind, string> = { homework: "Homework", quiz: "Quiz", material: "Material" };
export const TAB_LABEL: Record<KindFilter, string> = { all: "All", homework: "Homework", quiz: "Quiz", material: "Materials" };
export const SORT_LABEL: Record<SortOrder, string> = { latest: "Latest first", oldest: "Oldest first" };

/** JSON-safe resource passed from server pages to the client list. */
export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  kind: ResourceKind;
  /** http(s) link or "" when nothing is attached. */
  url: string;
  createdByName: string;
  batchId: string;
  batchName: string;
  /** The date shown on the card and used for sorting: publishAt when set, otherwise createdAt (ISO). */
  date: string;
  status: ResourceStatus;
  /** YYYY-MM-DD the resource was scheduled/published for (only when the staff member chose one). */
  publishDate: string;
}

/** Older records may hold any string; anything unknown is treated as a study material. */
export const normalizeKind = (k: unknown): ResourceKind =>
  k === "homework" || k === "quiz" ? k : "material";

/** Only absolute http(s) links may be opened (blocks javascript:, data:, file:, … ). */
export function isSafeHttpUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** The date a resource is "dated": its publish/scheduled date when set, otherwise when it was created. */
export const displayDate = (publishAt: Date | string | null | undefined, createdAt: Date | string): Date =>
  new Date(publishAt ?? createdAt);

/** Scheduled = publish date is still in the future. No publish date (all older records) = published. */
export function resourceStatus(publishAt: Date | string | null | undefined, now: Date = new Date()): ResourceStatus {
  return publishAt && new Date(publishAt).getTime() > now.getTime() ? "scheduled" : "published";
}

/**
 * Instant at which calendar day `dateStr` (YYYY-MM-DD) begins in time zone `tz`
 * (e.g. 2026-10-22 in Asia/Dhaka -> 2026-10-21T18:00:00Z).
 */
export function zonedStartOfDay(dateStr: string, tz: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const offsetAt = (ms: number) => {
    const p = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",
    }).formatToParts(new Date(ms));
    const g = (t: string) => Number(p.find((x) => x.type === t)?.value);
    return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second")) - ms;
  };
  let guess = target - offsetAt(target);
  guess = target - offsetAt(guess); // second pass settles DST edges
  return new Date(guess);
}

const norm = (s: string) => s.toLowerCase();

/** Search: every whitespace-separated term must appear in the title, description, creator, type or batch. */
export function matchesQuery(item: ResourceItem, query: string): boolean {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = norm([item.title, item.description, item.createdByName, KIND_LABEL[item.kind], item.batchName].join(" "));
  return terms.every((t) => hay.includes(t));
}

export interface ResourceView {
  kind: KindFilter;
  query: string;
  sort: SortOrder;
  /** "" = every batch (staff pages only). */
  batchId: string;
}

/** Search + batch filter (everything except the type tab) — the basis for the tab counts. */
export const searchResources = (items: ResourceItem[], view: Pick<ResourceView, "query" | "batchId">) =>
  items.filter((i) => (!view.batchId || i.batchId === view.batchId) && matchesQuery(i, view.query));

/** Counts shown on the tabs; they always equal what clicking that tab would list for the current search. */
export function countByKind(items: ResourceItem[]): Record<KindFilter, number> {
  const c: Record<KindFilter, number> = { all: items.length, homework: 0, quiz: 0, material: 0 };
  for (const i of items) c[i.kind] += 1;
  return c;
}

/** Newest/oldest by the displayed date; ties fall back to the id so the order is stable. */
export function sortResources(items: ResourceItem[], order: SortOrder): ResourceItem[] {
  const dir = order === "latest" ? -1 : 1;
  return [...items].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return diff !== 0 ? dir * diff : dir * a.id.localeCompare(b.id);
  });
}

/** Search + batch + type tab + sort, combined. */
export function applyView(items: ResourceItem[], view: ResourceView): ResourceItem[] {
  const searched = searchResources(items, view);
  return sortResources(view.kind === "all" ? searched : searched.filter((i) => i.kind === view.kind), view.sort);
}
