import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/** Legacy "Update Profile" page. Editing is now a modal on My Account, so old links/bookmarks just go there. */
export default async function ProfileEditPage() {
  const u = await getCurrentUser();
  redirect(u ? `/dashboard/${u.role}/account` : "/login");
}
