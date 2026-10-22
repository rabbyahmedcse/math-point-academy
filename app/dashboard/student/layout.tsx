
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireRole } from "@/lib/session";
import { studentNav } from "@/lib/nav";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import { studentNotices } from "@/lib/student-data";
import Footer from "@/app/footer";

/** Server-side guard: every page below this layout requires an active student. */
export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole(["student"]);
  await connectDB();

  const s = await Settings.findById("main").lean();

  // Red dot on the bell = a notice published in the last 3 days
  const recent = await studentNotices(user.batchId, 10);
  const dot = recent.some(
    (n) =>
      Date.now() - new Date(n.publishDate).getTime() <
      3 * 24 * 3600 * 1000
  );

  return (
    <div className="relative isolate min-h-screen">
      {/* Subtle ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-24 top-20 -z-10 h-72 w-72 rounded-full bg-violet-400/[0.07] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-24 bottom-20 -z-10 h-72 w-72 rounded-full bg-indigo-400/[0.07] blur-3xl"
      />

      {/* Dashboard navigation and page content */}
      <div className="relative">
        <DashboardShell
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            image: user.image,
            mustChangePassword: user.mustChangePassword,
          }}
          nav={studentNav}
          brand={s?.coachingName ?? SITE.name}
          bell={{
            href: "/dashboard/student/notices",
            dot,
          }}
        >
          <div className="student-page-enter">{children}</div>
        </DashboardShell>
      </div>

      {/* Site footer */}
      <div className="relative">
        <Footer />
      </div>

      <style>{`
        .student-page-enter {
          animation: studentPageEnter 450ms cubic-bezier(0.2, 0.75, 0.3, 1) both;
          transform-origin: top center;
        }

        @keyframes studentPageEnter {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0) scale(0.995);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .student-page-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
