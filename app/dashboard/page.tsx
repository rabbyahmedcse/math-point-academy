import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/** Role-based redirect after sign-in: /dashboard -> /dashboard/{admin|teacher|student}. */
export default async function DashboardIndex() {
  const user = await getCurrentUser();
  redirect(user ? `/dashboard/${user.role}` : "/login");
}
