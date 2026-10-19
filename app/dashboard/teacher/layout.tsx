import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireRole } from "@/lib/session";
import { teacherNav } from "@/lib/nav";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";

/** Server-side guard: every page below this layout requires an active teacher. */
export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["teacher"]);
  await connectDB();
  const s = await Settings.findById("main").lean();
  return (
    <DashboardShell
      user={{ name: user.name, role: user.role, studentId: user.studentId, image: user.image, mustChangePassword: user.mustChangePassword }}
      nav={teacherNav}
      brand={s?.coachingName ?? SITE.name}
      bell={{ href: "/dashboard/teacher/notices", dot: false }}
    >
      {children}
    </DashboardShell>
  );
}
