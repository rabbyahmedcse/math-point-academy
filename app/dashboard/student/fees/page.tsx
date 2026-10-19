import { PageHeader, StatCard } from "@/components/ui/bits";
import { FeeMonths } from "@/components/features/FeeMonths";
import { requireRole } from "@/lib/session";
import { studentFeeMonths } from "@/lib/student-data";
import { money } from "@/lib/utils";

/** Read-only dues + payment history with receipts. */
export default async function StudentFees() {
  const user = await requireRole(["student"]);
  const rows = await studentFeeMonths({ id: user.id, batchId: user.batchId, monthlyFee: user.monthlyFee });
  const due = rows.reduce((s, f) => s + Math.max(f.amountDue - f.paidTotal, 0), 0);
  const paid = rows.reduce((s, f) => s + f.paidTotal, 0);
  return (
    <>
      <PageHeader title="My fees" />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total paid" value={money(paid)} tone="green" />
        <StatCard label="Outstanding" value={money(due)} tone={due ? "red" : "green"} />
      </div>
      <FeeMonths rows={rows} receiptBase="/dashboard/student/fees/receipt" />
    </>
  );
}
