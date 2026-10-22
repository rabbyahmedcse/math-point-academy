import "server-only";
import { connectDB } from "./db";
import { batchScope } from "./access";
import { todayStr } from "./utils";
import { displayDate, isSafeHttpUrl, normalizeKind, resourceStatus, type ResourceItem } from "./resources";
import { Batch } from "@/models/Batch";
import { Material } from "@/models/Misc";
import type { SessionUser } from "./types";

interface MaterialLike {
  _id: { getTimestamp(): Date };
  title: string;
  description?: string | null;
  kind?: string | null;
  url?: string | null;
  createdByName?: string | null;
  batchId: unknown;
  publishAt?: Date | null;
  createdAt?: Date | null;
}

/** Maps a Material document to the JSON-safe shape used by the client list. Nothing is invented: dates come from publishAt / createdAt. */
function toItem(m: MaterialLike, batchName: string, now: Date): ResourceItem {
  const created = m.createdAt ?? m._id.getTimestamp(); // very old records without timestamps: fall back to the id's creation time
  return {
    id: String(m._id),
    title: m.title,
    description: m.description ?? "",
    kind: normalizeKind(m.kind),
    url: isSafeHttpUrl(m.url) ? (m.url as string) : "",
    createdByName: m.createdByName ?? "",
    batchId: String(m.batchId),
    batchName,
    date: displayDate(m.publishAt, created).toISOString(),
    status: resourceStatus(m.publishAt, now),
    publishDate: m.publishAt ? todayStr(m.publishAt) : "",
  };
}

/**
 * Resources this user may see — decided on the server:
 *  - student: only their own batch, and only items already published (publishAt absent or not in the future)
 *  - admin: every batch;  teacher: only the batches they teach
 */
export async function loadResources(user: SessionUser): Promise<ResourceItem[]> {
  await connectDB();
  const now = new Date();
  if (user.role === "student") {
    if (!user.batchId) return [];
    const [docs, batch] = await Promise.all([
      Material.find({ batchId: user.batchId, $or: [{ publishAt: { $exists: false } }, { publishAt: null }, { publishAt: { $lte: now } }] }).lean(),
      Batch.findById(user.batchId, { name: 1 }).lean(),
    ]);
    return docs.map((m) => toItem(m, batch?.name ?? "", now));
  }
  if (user.role !== "admin" && user.role !== "teacher") return [];
  const batches = await Batch.find(batchScope(user), { _id: 1, name: 1 }).lean();
  const names = new Map(batches.map((b) => [String(b._id), b.name]));
  const docs = await Material.find({ batchId: { $in: batches.map((b) => b._id) } }).sort({ createdAt: -1 }).limit(500).lean();
  return docs.map((m) => toItem(m, names.get(String(m.batchId)) ?? "", now));
}
