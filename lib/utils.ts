export const TZ = process.env.APP_TIMEZONE ?? "Asia/Dhaka";
export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** YYYY-MM-DD in the coaching's timezone (not the server's). */
export function todayStr(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export const monthStr = (d = new Date()) => todayStr(d).slice(0, 7);
/** Month (YYYY-MM) a student registered — fees and monthly reports start from here. */
export const joinMonth = (createdAt?: Date | string | null) => (createdAt ? monthStr(new Date(createdAt)) : "0000-00");
/** 01712345678 / +8801712345678 / 8801712345678 -> 01712345678 (for comparing phone numbers). */
export function normalizePhone(p?: string | null) {
  const d = (p ?? "").replace(/\D/g, "");
  return d.length === 13 && d.startsWith("88") ? d.slice(2) : d;
}
/** "Sunday, 19 October 2026" in the coaching's timezone. */
export function longDate(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }).formatToParts(d);
  const g = (t: string) => parts.find((x) => x.type === t)?.value ?? "";
  return `${g("weekday")}, ${g("day")} ${g("month")} ${g("year")}`;
}
export const weekdayOf = (s: string) => new Date(`${s}T00:00:00Z`).getUTCDay();
export function addDays(s: string, n: number) {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const formatDate = (s?: string | Date | null) =>
  s ? new Date(typeof s === "string" && s.length === 10 ? `${s}T00:00:00Z` : s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: typeof s === "string" && s.length === 10 ? "UTC" : TZ }) : "—";
export const formatMonth = (m: string) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
export function formatTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
export const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const timesOverlap = (s1: string, e1: string, s2: string, e2: string) =>
  toMinutes(s1) < toMinutes(e2) && toMinutes(s2) < toMinutes(e1);

export const money = (n: number) => `৳${Math.round(n).toLocaleString("en-US")}`;
export const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Convert Mongoose lean docs (ObjectId / Date) to JSON-safe plain objects for client components. */
export const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

type SessionRoutine = {
  _id: unknown; kind: string; dayOfWeek?: number | null; date?: string | null; startTime: string; endTime: string;
  subject: string; location?: string | null; status: string; note?: string | null; skipDates?: string[];
};
/** Expand weekly + one-off routines into concrete sessions for [from, from+days). */
export function expandSessions<T extends SessionRoutine>(routines: T[], from: string, days: number) {
  const out: { date: string; routine: T }[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(from, i);
    for (const r of routines) {
      if (r.kind === "weekly" && r.status === "scheduled" && r.dayOfWeek === weekdayOf(date) && !(r.skipDates ?? []).includes(date)) out.push({ date, routine: r });
      if (r.kind === "oneoff" && r.date === date) out.push({ date, routine: r });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.routine.startTime.localeCompare(b.routine.startTime));
}
