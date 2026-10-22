import type { NextRequest } from "next/server";
import { z } from "zod";
import { HttpError, getAttendanceReport, runReport } from "@/lib/reports";

export const dynamic = "force-dynamic";

const Query = z.object({
  batch_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid batch_id"),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be YYYY-MM"),
});

/** GET /api/reports/attendance?batch_id=<id>&month=YYYY-MM — staff only (replaces FastAPI /reports/attendance). */
export function GET(req: NextRequest) {
  return runReport(async (user) => {
    const q = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!q.success) throw new HttpError(422, q.error.issues[0]?.message ?? "Invalid query");
    return getAttendanceReport(user, q.data.batch_id, q.data.month);
  });
}
