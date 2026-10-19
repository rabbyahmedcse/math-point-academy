import Link from "next/link";
import { cn } from "@/lib/utils";
import { pendingLinkCount, type Child } from "@/lib/parent-data";
import { PageHeader, Empty } from "@/components/ui/bits";
import { Avatar } from "@/components/ui/Avatar";

export { Avatar };

/** Pill switcher shown on every parent page when the parent has more than one child. */
export function ChildPicker({ kids, selectedId, basePath }: { kids: Child[]; selectedId: string; basePath: string }) {
  if (kids.length < 2) return null;
  return (
    <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Choose child">
      {kids.map((c) => (
        <Link key={c.id} href={`${basePath}?child=${c.id}`} role="tab" aria-selected={c.id === selectedId}
          className={cn("flex items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm font-medium",
            c.id === selectedId ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
          <Avatar name={c.name} image={c.image} size="h-8 w-8 text-sm" />{c.name}
        </Link>
      ))}
    </div>
  );
}

/** Shown on every parent page until at least one child is verified. */
export async function NoChild({ parentId }: { parentId: string }) {
  const pending = await pendingLinkCount(parentId);
  return (
    <>
      <PageHeader title="No verified child yet" />
      <Empty>
        {pending > 0
          ? "Your request is waiting for a teacher or admin to verify it. Your child's information will appear here after approval."
          : "No child is linked to your account yet. Children whose guardian mobile matches your number appear here automatically once approved — otherwise please contact the coaching center."}
      </Empty>
    </>
  );
}
