import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireRole } from "@/lib/session";
import { studentNav } from "@/lib/nav";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import { studentNotices } from "@/lib/student-data";

/** Server-side guard: every page below this layout requires an active student. */
export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["student"]);
  await connectDB();
  const s = await Settings.findById("main").lean();
  // red dot on the bell = a notice published in the last 3 days
  const recent = await studentNotices(user.batchId, 10);
  const dot = recent.some((n) => Date.now() - new Date(n.publishDate).getTime() < 3 * 24 * 3600 * 1000);
  return (
    <DashboardShell
      user={{ name: user.name, role: user.role, studentId: user.studentId, image: user.image, mustChangePassword: user.mustChangePassword }}
      nav={studentNav}
      brand={s?.coachingName ?? SITE.name}
      bell={{ href: "/dashboard/student/notices", dot }}
    >
      {children}
    </DashboardShell>
  );
}
