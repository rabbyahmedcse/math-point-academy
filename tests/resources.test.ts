import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyView, countByKind, displayDate, isSafeHttpUrl, matchesQuery, normalizeKind, resourceStatus, searchResources, sortResources, zonedStartOfDay,
  type ResourceItem,
} from "../lib/resources";

const mk = (o: Partial<ResourceItem> & { id: string }): ResourceItem => ({
  title: "T", description: "", kind: "material", url: "https://e.com/x", createdByName: "evan", batchId: "b1", batchName: "Class 9",
  date: "2026-10-19T00:00:00.000Z", status: "published", publishDate: "", ...o,
});
const items = [
  mk({ id: "1", title: "Algebra worksheet", kind: "homework", date: "2026-10-10T00:00:00Z", description: "Chapter 3 exercises" }),
  mk({ id: "2", title: "Weekly quiz", kind: "quiz", date: "2026-10-19T00:00:00Z", createdByName: "Rahim" }),
  mk({ id: "3", title: "Geometry notes", kind: "material", date: "2026-10-15T00:00:00Z", batchId: "b2", batchName: "Class 10" }),
  mk({ id: "4", title: "Trigonometry homework", kind: "homework", date: "2026-10-12T00:00:00Z" }),
];

test("counts per type equal the list each tab shows", () => {
  assert.deepEqual(countByKind(items), { all: 4, homework: 2, quiz: 1, material: 1 });
  for (const k of ["homework", "quiz", "material"] as const)
    assert.equal(applyView(items, { kind: k, query: "", sort: "latest", batchId: "" }).length, countByKind(items)[k]);
});

test("All tab shows everything", () => assert.equal(applyView(items, { kind: "all", query: "", sort: "latest", batchId: "" }).length, 4));

test("sort latest first / oldest first use the displayed date", () => {
  assert.deepEqual(sortResources(items, "latest").map((i) => i.id), ["2", "3", "4", "1"]);
  assert.deepEqual(sortResources(items, "oldest").map((i) => i.id), ["1", "4", "3", "2"]);
});

test("sort is stable on equal dates and does not mutate input", () => {
  const same = [mk({ id: "a" }), mk({ id: "b" }), mk({ id: "c" })];
  assert.deepEqual(sortResources(same, "latest").map((i) => i.id), ["c", "b", "a"]);
  assert.deepEqual(same.map((i) => i.id), ["a", "b", "c"]);
});

test("search matches title, description, creator, type label and batch; terms are ANDed; case-insensitive", () => {
  assert.deepEqual(items.filter((i) => matchesQuery(i, "ALGEBRA")).map((i) => i.id), ["1"]);
  assert.deepEqual(items.filter((i) => matchesQuery(i, "chapter 3")).map((i) => i.id), ["1"]);
  assert.deepEqual(items.filter((i) => matchesQuery(i, "rahim")).map((i) => i.id), ["2"]);
  assert.deepEqual(items.filter((i) => matchesQuery(i, "quiz")).map((i) => i.id), ["2"]);
  assert.deepEqual(items.filter((i) => matchesQuery(i, "class 10")).map((i) => i.id), ["3"]);
  assert.deepEqual(items.filter((i) => matchesQuery(i, "homework trig")).map((i) => i.id), ["4"]);
  assert.equal(items.filter((i) => matchesQuery(i, "zzz")).length, 0);
  assert.equal(items.filter((i) => matchesQuery(i, "   ")).length, 4);
});

test("search, tab and sort combine; tab counts follow the search", () => {
  const searched = searchResources(items, { query: "homework", batchId: "" }); // ids 1,4 (type label) 
  assert.deepEqual(countByKind(searched), { all: 2, homework: 2, quiz: 0, material: 0 });
  assert.deepEqual(applyView(items, { kind: "homework", query: "homework", sort: "oldest", batchId: "" }).map((i) => i.id), ["1", "4"]);
  assert.deepEqual(applyView(items, { kind: "quiz", query: "homework", sort: "latest", batchId: "" }), []);
});

test("batch filter", () => {
  assert.deepEqual(applyView(items, { kind: "all", query: "", sort: "latest", batchId: "b2" }).map((i) => i.id), ["3"]);
});

test("unknown / legacy kinds are treated as material", () => {
  assert.equal(normalizeKind("homework"), "homework"); assert.equal(normalizeKind("quiz"), "quiz");
  assert.equal(normalizeKind("material"), "material"); assert.equal(normalizeKind(undefined), "material"); assert.equal(normalizeKind("weird"), "material");
});

test("only http(s) links are openable", () => {
  for (const ok of ["https://drive.google.com/file/d/1/view", "http://example.com/a.pdf"]) assert.equal(isSafeHttpUrl(ok), true);
  for (const bad of ["", null, undefined, "javascript:alert(1)", "data:text/html,hi", "file:///etc/passwd", "ftp://x.com/a", "not a url", "//evil.com"]) assert.equal(isSafeHttpUrl(bad as never), false);
});

test("status: no publish date = published (all legacy records); future = scheduled", () => {
  const now = new Date("2026-10-21T10:00:00Z");
  assert.equal(resourceStatus(undefined, now), "published");
  assert.equal(resourceStatus(null, now), "published");
  assert.equal(resourceStatus("2026-10-20T00:00:00Z", now), "published");
  assert.equal(resourceStatus("2026-10-22T00:00:00Z", now), "scheduled");
});

test("display date is publishAt when set, otherwise createdAt (nothing invented)", () => {
  assert.equal(displayDate(null, "2026-01-02T00:00:00Z").toISOString(), "2026-01-02T00:00:00.000Z");
  assert.equal(displayDate("2026-03-04T00:00:00Z", "2026-01-02T00:00:00Z").toISOString(), "2026-03-04T00:00:00.000Z");
});

test("zonedStartOfDay: start of the calendar day in the coaching time zone", () => {
  assert.equal(zonedStartOfDay("2026-10-22", "Asia/Dhaka").toISOString(), "2026-10-21T18:00:00.000Z");
  assert.equal(zonedStartOfDay("2026-10-22", "UTC").toISOString(), "2026-10-22T00:00:00.000Z");
  assert.equal(zonedStartOfDay("2026-03-08", "America/New_York").toISOString(), "2026-03-08T05:00:00.000Z"); // before US DST starts at 2am
  assert.equal(zonedStartOfDay("2026-03-09", "America/New_York").toISOString(), "2026-03-09T04:00:00.000Z"); // after
});
