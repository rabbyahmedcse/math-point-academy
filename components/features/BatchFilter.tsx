import type { ReactNode } from "react";

/** Plain GET form (no JS): picks a batch (+ optional extra inputs) via the URL query string. */
export function BatchFilter({ batches, selected, children, label = "Show" }: {
  batches: { _id: unknown; name: string }[]; selected?: string; children?: ReactNode; label?: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-2">
      <label className="block">
        <span className="label">Batch</span>
        <select name="batch" defaultValue={selected ?? ""} className="input min-w-44">
          <option value="" disabled>Select a batch…</option>
          {batches.map((b) => <option key={String(b._id)} value={String(b._id)}>{b.name}</option>)}
        </select>
      </label>
      {children}
      <button className="btn btn-secondary">{label}</button>
    </form>
  );
}
