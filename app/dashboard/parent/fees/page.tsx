import { PageHeader, StatCard } from "@/components/ui/bits";
import { ChildPicker, NoChild } from "@/components/features/parent/ChildPicker";
import { FeeMonths } from "@/components/features/FeeMonths";
import { requireRole } from "@/lib/session";
import { resolveChild } from "@/lib/parent-data";
import { studentFeeMonths } from "@/lib/student-data";
import { money, monthStr } from "@/lib/utils";

export default async function ParentFees({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireRole(["parent"]);
  const { children, child } = await resolveChild(user.id, (await searchParams).child);
  if (!child) return <NoChild parentId={user.id} />;

  const rows = await studentFeeMonths({ id: child.id, batchId: child.batchId, monthlyFee: child.monthlyFee });
  const cur = rows.find((r) => r.month === monthStr());
  const paid = rows.reduce((s, r) => s + r.paidTotal, 0);
  const due = rows.reduce((s, r) => s + Math.max(r.amountDue - r.paidTotal, 0), 0);

  return (
    <>
      <PageHeader title="Monthly Fee" subtitle={`${child.name} · ${child.studentId}`} />
      <ChildPicker kids={children} selectedId={child.id} basePath="/dashboard/parent/fees" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="This month's fee" value={cur ? money(cur.amountDue) : "—"} />
        <StatCard label="Paid (all months)" value={money(paid)} tone="green" />
        <StatCard label="Due (all months)" value={money(due)} tone={due ? "red" : "green"} />
      </div>
      <FeeMonths rows={rows} receiptBase="/dashboard/parent/fees/receipt" />
    </>
  );
}
