
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireRole } from "@/lib/session";
import { teacherNav } from "@/lib/nav";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import Footer from "@/app/footer";

/** Server-side guard: every page below this layout requires an active teacher. */
export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole(["teacher"]);

  await connectDB();

  const s = await Settings.findById("main").lean();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Subtle ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-32 top-32 -z-0 h-72 w-72 rounded-full bg-indigo-400/10 blur-[100px]"
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="min-w-0 flex-1">
          <DashboardShell
            user={{
              name: user.name,
              email: user.email,
              role: user.role,
              studentId: user.studentId,
              image: user.image,
              mustChangePassword: user.mustChangePassword,
            }}
            nav={teacherNav}
            brand={s?.coachingName ?? SITE.name}
            bell={{
              href: "/dashboard/teacher/notices",
              dot: false,
            }}
          >
            <div className="min-w-0 animate-[fadeInUp_0.45s_ease-out_both]">
              {children}
            </div>
          </DashboardShell>
        </div>

        <Footer />
      </div>
    </div>
  );
}
