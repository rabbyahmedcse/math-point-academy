
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireRole } from "@/lib/session";
import { parentNav } from "@/lib/nav";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import Footer from "@/app/footer";

/** Server-side guard: every page below this layout requires an active parent. */
export default async function ParentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole(["parent"]);

  await connectDB();
  const s = await Settings.findById("main").lean();

  return (
    <div>
      <DashboardShell
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          image: user.image,
          mustChangePassword: user.mustChangePassword,
        }}
        nav={parentNav}
        brand={s?.coachingName ?? SITE.name}
        bell={{
          href: "/dashboard/parent/routine",
          dot: false,
        }}
      >
        {children}
      </DashboardShell>

      <Footer />
    </div>
  );
}
