import Link from "next/link";
import { Badge, Empty, TableWrap } from "@/components/ui/bits";
import { formatDate, formatMonth, money } from "@/lib/utils";
import type { FeeMonthRow } from "@/lib/student-data";

/** Read-only month-by-month fees with payments and receipt links (used by Student and Parent pages). */
export function FeeMonths({ rows, receiptBase }: { rows: FeeMonthRow[]; receiptBase: string }) {
  if (rows.length === 0) return <Empty>No fee records yet.</Empty>;
  return (
    <div className="space-y-4">
      {rows.map((f) => {
        const due = Math.max(f.amountDue - f.paidTotal, 0);
        return (
          <section key={f.key} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{formatMonth(f.month)}</h2>
              <Badge value={f.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">Fee {money(f.amountDue)} · Paid <span className="text-emerald-600">{money(f.paidTotal)}</span> · <b className={due ? "text-red-600" : ""}>Due {money(due)}</b></p>
            {f.payments.length > 0 && (
              <div className="mt-2">
                <TableWrap>
                  <thead className="bg-slate-50"><tr><th className="th">Date</th><th className="th">Amount</th><th className="th">Method</th><th className="th">Receipt</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {f.payments.map((p) => (
                      <tr key={p.receiptNo}><td className="td">{formatDate(p.date)}</td><td className="td">{money(p.amount)}</td><td className="td capitalize">{p.method}</td>
                        <td className="td"><Link className="text-indigo-600 hover:underline" href={`${receiptBase}/${f.feeId}-${p.receiptNo}`}>{p.receiptNo}</Link></td></tr>
                    ))}
                  </tbody>
                </TableWrap>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
