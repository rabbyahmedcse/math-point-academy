import { PageHeader, TableWrap } from "@/components/ui/bits";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { AuditLog, Settings } from "@/models/Misc";
import { saveSettings } from "@/actions/admin";
import { SITE } from "@/lib/site";

export default async function SettingsPage() {
  await requireRole(["admin"]);
  await connectDB();
  const [s, logs] = await Promise.all([Settings.findById("main").lean(), AuditLog.find().sort({ at: -1 }).limit(40).lean()]);
  return (
    <>
      <PageHeader title="Settings" subtitle="Coaching profile and activity history" />
      <div className="card mb-6 max-w-xl">
        <ActionForm action={saveSettings} submitLabel="Save settings" resetOnSuccess={false} className="space-y-2">
          <Field label="Coaching name"><input name="coachingName" required defaultValue={s?.coachingName ?? SITE.name} className="input" /></Field>
          <Field label="Facebook page link (shown in the home page footer)"><input name="facebookUrl" type="url" defaultValue={s?.facebookUrl ?? ""} placeholder="https://facebook.com/…" className="input" /></Field>
          <Field label="Phone (shown on home page)"><input name="phone" defaultValue={s?.phone ?? ""} placeholder="Leave empty to show the numbers from lib/site.ts" className="input" /></Field>
          <Field label="Address (home page and receipts)"><input name="address" defaultValue={s?.address ?? ""} placeholder="Leave empty to use the default address" className="input" /></Field>
        </ActionForm>
      </div>
      <h2 className="h2">Recent activity</h2>
      <TableWrap>
        <thead className="bg-slate-50"><tr><th className="th">When</th><th className="th">Who</th><th className="th">Action</th><th className="th">Detail</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((l) => (
            <tr key={String(l._id)}><td className="td whitespace-nowrap text-xs">{l.at.toLocaleString("en-GB", { timeZone: process.env.APP_TIMEZONE ?? "Asia/Dhaka" })}</td><td className="td">{l.actorName}</td><td className="td font-mono text-xs">{l.action}</td><td className="td text-xs text-slate-500">{l.detail}</td></tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
