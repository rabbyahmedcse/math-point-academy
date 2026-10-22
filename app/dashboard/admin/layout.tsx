import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireRole } from "@/lib/session";
import { adminNav } from "@/lib/nav";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Misc";
import { SITE } from "@/lib/site";
import Footer from "@/app/footer";

/** Server-side guard: every page below this layout requires an active admin. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["admin"]);
  await connectDB();
  const s = await Settings.findById("main").lean();
  return (
<div>
<DashboardShell
      user={{ name: user.name, email: user.email, role: user.role, studentId: user.studentId, image: user.image, mustChangePassword: user.mustChangePassword }}
      nav={adminNav}
      brand={s?.coachingName ?? SITE.name}
      bell={{ href: "/dashboard/admin/notices", dot: false }}
    >
      {children}
    </DashboardShell>
    <Footer></Footer>
</div>
  );
}
