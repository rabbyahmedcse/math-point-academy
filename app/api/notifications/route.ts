import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Notice } from "@/models/Notice";
import { NoticeRead } from "@/models/NoticeRead";
import { ParentLink } from "@/models/ParentLink";
import { Batch } from "@/models/Batch";

export const dynamic = "force-dynamic";

async function visibleNotices(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  const now = new Date();
  const dateFilter = {
    publishDate: { $lte: now },
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] },
    ],
  };

  if (user.role === "admin") {
    return Notice.find(dateFilter).sort({ publishDate: -1 }).limit(100).lean();
  }

  if (user.role === "student") {
    return Notice.find({
      ...dateFilter,
      $or: [
        { audience: "all" },
        ...(user.batchId ? [{ audience: "batches", batchIds: new Types.ObjectId(user.batchId) }] : []),
      ],
    }).sort({ publishDate: -1 }).limit(100).lean();
  }

  if (user.role === "parent") {
    const links = await ParentLink.find({ parentId: new Types.ObjectId(user.id), status: "active" }, { studentId: 1 }).lean();
    const students = links.map((link) => link.studentId);
    const batches = students.length
      ? await (await import("@/models/User")).User.find({ _id: { $in: students } }, { batchId: 1 }).lean()
      : [];
    const batchIds = batches.map((student) => student.batchId).filter(Boolean);
    return Notice.find({
      ...dateFilter,
      $or: [
        { audience: "all" },
        ...(batchIds.length ? [{ audience: "batches", batchIds: { $in: batchIds } }] : []),
      ],
    }).sort({ publishDate: -1 }).limit(100).lean();
  }

  // Teachers receive notices addressed to all teachers, all students, their own notices,
  // and notices for batches they teach.
  const taughtBatches = await Batch.find({ teacherIds: new Types.ObjectId(user.id) }, { _id: 1 }).lean();
  return Notice.find({
    ...dateFilter,
    $or: [
      { audience: "all" },
      { audience: "teachers" },
      { createdBy: new Types.ObjectId(user.id) },
      ...(taughtBatches.length ? [{ audience: "batches", batchIds: { $in: taughtBatches.map((b) => b._id) } }] : []),
    ],
  }).sort({ publishDate: -1 }).limit(100).lean();
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const notices = await visibleNotices(user);
  const reads = await NoticeRead.find({
    userId: new Types.ObjectId(user.id),
    noticeId: { $in: notices.map((notice) => notice._id) },
  }, { noticeId: 1 }).lean();
  const readIds = new Set(reads.map((read) => String(read.noticeId)));
  const items = notices.slice(0, 12).map((notice) => ({
    id: String(notice._id),
    title: notice.title,
    body: notice.body,
    createdAt: notice.publishDate,
    read: readIds.has(String(notice._id)),
    href: `/dashboard/${user.role}/notices`,
  }));
  return NextResponse.json({
    items,
    unreadCount: notices.filter((notice) => !readIds.has(String(notice._id))).length,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { id?: string; all?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  await connectDB();
  const notices = await visibleNotices(user);
  const visibleIds = notices.map((notice) => notice._id);
  const userId = new Types.ObjectId(user.id);

  if (body.all === true) {
    const now = new Date();
    await NoticeRead.bulkWrite(visibleIds.map((noticeId) => ({
      updateOne: {
        filter: { userId, noticeId },
        update: { $setOnInsert: { userId, noticeId, readAt: now } },
        upsert: true,
      },
    })));
    return NextResponse.json({ success: true, marked: visibleIds.length });
  }

  if (!body.id || !Types.ObjectId.isValid(body.id)) {
    return NextResponse.json({ error: "A valid notice id is required" }, { status: 400 });
  }
  const noticeId = new Types.ObjectId(body.id);
  if (!visibleIds.some((id) => String(id) === body.id)) {
    return NextResponse.json({ error: "Notice not found" }, { status: 404 });
  }
  await NoticeRead.updateOne(
    { userId, noticeId },
    { $setOnInsert: { userId, noticeId, readAt: new Date() } },
    { upsert: true },
  );
  return NextResponse.json({ success: true });
}
