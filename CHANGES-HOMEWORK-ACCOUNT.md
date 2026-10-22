# Homework & Materials redesign + My Account / Edit Profile / Change Password

## Database (backward-compatible, no migration needed)
`Material` (collection `materials`): `kind` enum widened to `homework | quiz | material`; new OPTIONAL `publishAt` (Date).
Existing records have no `publishAt` -> treated as **Published**, dated by `createdAt`. A future `publishAt` is **hidden from students on the server** until that day (shown to staff as *Scheduled*). Unknown legacy `kind` values render as Material. Nothing is rewritten or deleted.
Users: no schema change. `address` and `image` (photo link) may now be set by every role (previously students only).

## Authorization (all enforced in server actions / queries, not just the UI)
- Students: own batch only, published items only. Teachers: only batches they teach (unchanged `assertBatchAccess`). Admin: all.
- New `updateMaterial` checks access to both the current and the target batch. `deleteMaterial` unchanged.
- Resource links must be `http(s)` (zod `.url()` previously also accepted `javascript:`); links are re-checked before rendering.
- `updateProfile` edits only the session user. **Parent mobile number cannot change**: a different number (or clearing it) is rejected with an error; the number is never written for parents. Rule lives in `lib/profile-rules.ts` (unit-tested). Student name stays read-only (existing policy).

## Behaviour notes
- `/dashboard/<role>/account/edit` now redirects to My Account (editing is a modal). Change password lives at `/dashboard/<role>/account/password`.
- "Forgot password?" is a UI placeholder only (shows "Password recovery will be available soon").
- Password guidance says **8 characters** (the enforced Better Auth policy), not the 6 shown in the mockup.
- "Quiz" is a resource type (usually a link, e.g. a Google Form). There is no in-app quiz engine; none existed before.
- There is no file-upload backend; resources are links (Drive, PDF, image URL…), as before.

## Google Drive photo links (see README)
New `lib/image-url.ts` (pure), `components/ui/useImageSource.ts`, `components/ui/PhotoImage.tsx`; `Avatar`, `StudentsPage` and the Edit Profile modal now use them. No database or config change.
