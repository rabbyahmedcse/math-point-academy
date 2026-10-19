"use client";

import { useState } from "react";
import { ActionForm, Field } from "@/components/ui/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { updateProfile } from "@/actions/profile";

export function ProfileForm({ role, name, email, phone, address, image }: {
  role: string; name: string; email: string; phone?: string; address?: string; image?: string;
}) {
  const [url, setUrl] = useState(image ?? "");
  const isStudent = role === "student";
  const phoneLocked = role === "parent";

  return (
    <ActionForm action={updateProfile} submitLabel="Save changes" submitClassName="btn btn-primary min-w-40" resetOnSuccess={false} className="space-y-6">
      {isStudent && (
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={name} image={url} size="h-28 w-28 text-4xl ring-4 ring-white shadow-lg" />
          <div className="min-w-60 flex-1">
            <Field label="Photo link (image URL)">
              <input name="image" type="url" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={500} placeholder="https://example.com/my-photo.jpg" className="input" />
            </Field>
            <p className="mt-1.5 text-xs text-slate-500">Paste a direct link to your photo (it should open the picture itself). Only the link is saved — the photo is shown from that address. Leave empty to remove.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input name="name" defaultValue={name} required={!isStudent} disabled={isStudent} className="input" />
          {isStudent && <span className="mt-1 block text-xs text-slate-500">Ask the coaching center to correct your name.</span>}
        </Field>
        <Field label="Email (login)">
          <input value={email} disabled readOnly className="input" />
        </Field>
        <Field label="Mobile number">
          <input name="phone" defaultValue={phone ?? ""} disabled={phoneLocked} placeholder="01XXXXXXXXX" inputMode="tel" required={isStudent} className="input" />
          {phoneLocked && <span className="mt-1 block text-xs text-slate-500">This number links your children, so it cannot be changed here.</span>}
        </Field>
        {isStudent && <Field label="Address"><input name="address" defaultValue={address ?? ""} maxLength={200} className="input" /></Field>}
      </div>
    </ActionForm>
  );
}
