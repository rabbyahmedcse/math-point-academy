import type { NextRequest } from "next/server";
import { z } from "zod";
import { HttpError, getFeeReport, runReport } from "@/lib/reports";

export const dynamic = "force-dynamic";

const Query = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be YYYY-MM").optional(),
});

/** GET /api/reports/fees?month=YYYY-MM — staff only (replaces FastAPI /reports/fees). Defaults to the current month. */
export function GET(req: NextRequest) {
  return runReport(async (user) => {
    const q = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!q.success) throw new HttpError(422, q.error.issues[0]?.message ?? "Invalid query");
    return getFeeReport(user, q.data.month);
  });
}
