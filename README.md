# Coaching Management System v1.1

Next.js 15 (App Router) · Tailwind CSS 4 · MongoDB (Mongoose) · Better Auth. Single Next.js + Node.js application (no separate backend).
Implements the Admin / Teacher / Student flows from *Coaching_Management_System_Requirements_BN_v1_1.docx*.

## Implementation plan (in the order it was built)
1. **Data model** – Mongoose schemas in `models/`. `User` maps onto Better Auth's own `user` collection, so auth and domain data share one record (role, status, studentId, permissions).
2. **Auth** – `lib/auth.ts`: MongoDB adapter, email+password, `username` plugin (Student ID login), custom user fields, public sign-up **disabled**, and a `session.create.before` hook that refuses sessions for pending/rejected/inactive users.
3. **Authorization** – `lib/session.ts` (`requireRole` for pages, `requireActionUser` for actions) re-reads the user from MongoDB on **every** request; `lib/access.ts` adds per-teacher permissions and batch scoping. `middleware.ts` is only an optimistic cookie check.
4. **Business logic** – server actions in `actions/` (zod-validated, wrapped by `runAction` for uniform errors).
5. **UI** – role layouts (`app/dashboard/{admin,teacher,student}/layout.tsx`) + shared feature pages in `components/features/` that admin and teacher routes re-export.
6. **Ops** – `scripts/seed-admin.ts` (first admin), `app/api/reports/*` (staff reports).

## Setup
```bash
npm install
cp .env.example .env.local        # fill BETTER_AUTH_SECRET (openssl rand -base64 32), MONGODB_URI, ADMIN_*
npm run seed:admin                # creates the first admin (once)
npm run dev                       # http://localhost:3000
```
Flow: admin signs in → creates teacher (temporary password, forced change) → students register at `/register` (get `STU-YYYY-NNNN`, status *pending*) → teacher approves + assigns batch → student signs in with Student ID or email.

## Key design decisions
| Requirement | Where / how |
|---|---|
| No plain-text passwords | Better Auth hashes (scrypt) into `account`; we never see or store passwords. Users are created through `ctx.password.hash` + `internalAdapter` (`lib/users.ts`). |
| Unique Student ID | `lib/student-id.ts` – atomic `findOneAndUpdate/$inc` counter; plus unique sparse index on `studentId`. |
| Duplicate registration | email check (Better Auth) + unique partial index on student phone. |
| Pending = no access | `session.create.before` hook in `lib/auth.ts` + `getCurrentUser` requires `status=active`. |
| Backend role checks | Every action calls `requireActionUser([...])`; teachers are also scoped to batches they teach and gated by admin-controlled permissions. |
| Audit history | Attendance corrections (`history`), exam marks (`audit`), payments (void with reason, never deleted), `AuditLog` collection (Settings page). |
| Result publishing | Admin **and** the batch's teacher publish directly, can unpublish, and can correct marks/performance even after publishing; every change is stored in the exam's audit history. Students only query `publishStatus: "published"` and only their own row. |
| Performance rating | Replaces the free-text remark: Bad / Average / Good / Very Good / Excellent, chosen next to the marks (`lib/performance.ts`). |
| Fee start month | A student appears in fees (and the monthly attendance report) only from the month they registered; earlier months never list them and payments for earlier months are rejected. |
| Routine conflicts | `actions/routines.ts` warns when a teacher overlaps; "Save anyway" checkbox overrides. Cancel/reschedule auto-post a batch notice. |
| Fee integrity | One `Fee` doc per student+month; atomic over-payment guard; Paid/Partial/Due derived; students with no record count as *Due* (`lib/stats.ts`). |

## Parent accounts (v1.1+)
Public page `/register/parent` creates a **parent** account and links the first child:
1. The Student ID must exist and the student must be approved.
2. The parent's mobile is compared with the *guardian mobile saved at student registration* → match = linked instantly (`verifiedBy: phone`); no match = link stays *pending* until a teacher (of that batch) or admin approves it on **Students → Parent link requests**.
3. **Siblings are linked automatically:** on a phone match, *every* approved student whose guardian mobile equals the parent's mobile is added to the dashboard (`lib/parent-link.ts`). A child approved later is added to already-registered parents with that mobile (hook in `approveStudent`).
4. Student IDs are sequential and guessable, so the phone match / staff approval is what protects a child's data. Max 5 link requests per student per day.

Parent dashboard (`/dashboard/parent`, read-only): **My Children** (cards + switcher), **Attendance**, **Routine & Notice**, **Monthly Fee** (with receipts), **Exam Results** (published only, subject-wise). Every page resolves the child through `lib/parent-data.ts#getChildren`, so a parent can never open a child that is not an *active* link, even by editing `?child=`.
Parents cannot add children manually: every approved student whose guardian mobile equals the parent's mobile is linked automatically (at registration, and when a later sibling is approved).

## My Account (all roles)
`/dashboard/<role>/account` shows profile + change-password (show/hide, strength meter); **Update Profile** opens `/dashboard/<role>/account/edit`.
Editable: admin/teacher = name, mobile · student = mobile, address and a **photo URL** · parent = name (mobile locked because it links children). Only students have a photo, and only the *URL* is stored in `user.image` — no image data is ever saved in the database. Parents see their child's photo (from that URL) on **My Children**. Run `npm run cleanup:images` once if you tried an earlier build that stored uploaded photos.

## Branding & home page
Public content (name, description, About Us, specialities, director, address, phones, e-mail) lives in `lib/site.ts`; the logo is `public/logo.jpg` (hero) and `public/logo-mark.png` / `app/icon.png` (header, sidebar, login, favicon). Admin → Settings can override the name, phone, address and add the **Facebook page link** (shown in the footer once set).

## Dashboard layout
`components/layout/DashboardShell.tsx` is the shared layout for all roles: white sidebar with icons (active item in solid blue, red Logout at the bottom), top bar with a notice bell (red dot when a notice was published in the last 3 days — students only) and a user menu. The student home (`app/dashboard/student/page.tsx`) has the welcome banner, profile card, attendance ring, due / latest result / next class tiles, upcoming classes, notices and a due-fee alert; its building blocks are in `components/features/dashboard/parts.tsx`.

## Reports API (Node.js Route Handlers)
Staff-only JSON reports live in `app/api/reports/*` and `lib/reports.ts` (they replaced the former optional FastAPI service; see `MIGRATION.md`). Role and status are re-read from MongoDB on every call; teachers are limited to their own batches.

| Endpoint | Query | Response |
|---|---|---|
| `GET /api/reports/attendance` | `batch_id`, `month=YYYY-MM` | `[{studentId, name, attended, sessions, percent}]` |
| `GET /api/reports/fees` | `month=YYYY-MM` (optional, default current month) | `{month, records, expected, collected, due}` |

Errors use `{ "detail": "..." }` with 401 / 403 / 404 / 422. Tests: `npm test`.

## Deploying to Vercel
1. Push the project (the folder containing `package.json`) to Git and import it in Vercel; if it is a sub-folder of a repo, set **Root Directory** to it. Framework preset: Next.js (defaults are fine).
2. Add the variables from `.env.example` (`MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, optional `NEXT_PUBLIC_APP_URL`, `APP_TIMEZONE`). Set `BETTER_AUTH_URL` to the exact production origin (`https://…`).
3. In MongoDB Atlas -> Network Access allow Vercel's egress (commonly `0.0.0.0/0` with a strong DB user, since Vercel IPs are dynamic).
4. Better Auth only trusts its own `BETTER_AUTH_URL` origin: sign-in from a Vercel *preview* URL or a custom domain that differs from it will be rejected until you add it (Better Auth `trustedOrigins`) or use one canonical domain.
5. Admin seeding: only for a brand-new empty database. `npm run seed:admin` is idempotent (does nothing if an admin exists) but run it locally with `.env.local`; do not put `ADMIN_PASSWORD` in Vercel.

## Production checklist
- Set a strong `BETTER_AUTH_SECRET`; serve over HTTPS; remove `ADMIN_PASSWORD` after seeding.
- Better Auth's rate limiter is in-memory by default – use secondary storage (Redis/Mongo) if you run several instances.
- Schedule `mongodump` backups **and test a restore** (requirement §9).
- File upload for notices/materials is link-based in v1; add S3/Cloudinary later.
- Add SMS/payment gateway later (out of MVP scope).

## File tree
```
.env.example
.gitignore
actions/admin.ts
actions/attendance.ts
actions/auth.ts
actions/batches.ts
actions/exams.ts
actions/fees.ts
actions/materials.ts
actions/notices.ts
actions/routines.ts
actions/students.ts
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
app/api/auth/[...all]/route.ts
app/dashboard/admin/account/page.tsx
app/dashboard/admin/attendance/page.tsx
app/dashboard/admin/batches/page.tsx
app/dashboard/admin/exams/page.tsx
app/dashboard/admin/fees/page.tsx
app/dashboard/admin/fees/receipt/[ref]/page.tsx
app/dashboard/admin/layout.tsx
app/dashboard/admin/materials/page.tsx
app/dashboard/admin/notices/page.tsx
app/dashboard/admin/page.tsx
app/dashboard/admin/routine/page.tsx
app/dashboard/admin/settings/page.tsx
app/dashboard/admin/students/page.tsx
app/dashboard/admin/teachers/page.tsx
app/dashboard/page.tsx
app/dashboard/student/account/page.tsx
app/dashboard/student/attendance/page.tsx
app/dashboard/student/fees/page.tsx
app/dashboard/student/fees/receipt/[ref]/page.tsx
app/dashboard/student/layout.tsx
app/dashboard/student/materials/page.tsx
app/dashboard/student/notices/page.tsx
app/dashboard/student/page.tsx
app/dashboard/student/results/page.tsx
app/dashboard/student/routine/page.tsx
app/dashboard/teacher/account/page.tsx
app/dashboard/teacher/attendance/page.tsx
app/dashboard/teacher/batches/page.tsx
app/dashboard/teacher/exams/page.tsx
app/dashboard/teacher/fees/page.tsx
app/dashboard/teacher/fees/receipt/[ref]/page.tsx
app/dashboard/teacher/layout.tsx
app/dashboard/teacher/materials/page.tsx
app/dashboard/teacher/notices/page.tsx
app/dashboard/teacher/page.tsx
app/dashboard/teacher/routine/page.tsx
app/dashboard/teacher/students/page.tsx
app/globals.css
app/layout.tsx
app/page.tsx
components/auth/LoginForm.tsx
components/auth/RegisterForm.tsx
components/features/AccountPage.tsx
components/features/AttendancePage.tsx
components/features/AttendanceSheet.tsx
components/features/BatchFilter.tsx
components/features/BatchesPage.tsx
components/features/ChangePassword.tsx
components/features/ExamsPage.tsx
components/features/FeesPage.tsx
components/features/MaterialsPage.tsx
components/features/NoticesPage.tsx
components/features/PrintButton.tsx
components/features/ReceiptPage.tsx
components/features/RoutinePage.tsx
components/features/SettingsPage.tsx
components/features/StudentsPage.tsx
components/features/TeachersPage.tsx
components/layout/DashboardShell.tsx
components/ui/ActionForm.tsx
components/ui/bits.tsx
lib/access.ts
lib/action.ts
lib/audit.ts
lib/auth-client.ts
lib/auth.ts
lib/db.ts
lib/nav.ts
lib/session.ts
lib/stats.ts
lib/student-data.ts
lib/student-id.ts
lib/types.ts
lib/users.ts
lib/utils.ts
lib/validators.ts
middleware.ts
models/Attendance.ts
models/Batch.ts
models/Exam.ts
models/Fee.ts
models/Misc.ts
models/Notice.ts
models/Routine.ts
models/User.ts
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
app/api/reports/attendance/route.ts
app/api/reports/fees/route.ts
lib/report-calc.ts
lib/reports.ts
tests/report-calc.test.ts
scripts/seed-admin.ts
tsconfig.json
```


## UI loading, not-found, and notification read status

- Added a global `app/loading.tsx` loading state and a Bengali-friendly `app/not-found.tsx` page.
- Added `NoticeRead` records keyed by user and notice so read status is personal to each account.
- Added `/api/notifications` to return role-scoped visible notices and to mark one notice or all visible notices as read.
- Added a notification dropdown with unread red indicator, per-notice read action, and “Mark all read”.
- Notifications are loaded from the existing `Notice` collection; no notice content is duplicated.
- The project type-check passed after these changes. A production build could not be verified in this environment because the packaged `next` executable returned `Permission denied`; run `npm ci` and `npm run build` locally before deploying.


## Profile photos & Google Drive links
Photos are stored exactly as the user pasted them (no schema change) and converted **when rendered** by `lib/image-url.ts`, so existing records are fixed too.
Supported Drive links: `/file/d/ID/view…`, `/open?id=ID`, `/uc?export=view&id=ID`, `/thumbnail?id=ID`. They are shown through Google's thumbnail endpoint
(`https://drive.google.com/thumbnail?id=ID&sz=w256`), with `uc?export=view` as a single second attempt, then the initials fallback. Other image URLs are used unchanged.

**Sharing setup (required by Google, cannot be bypassed):** open the image in Drive -> Share -> General access -> **Anyone with the link** -> role **Viewer** -> Copy link.
Private, deleted or quota-limited files, folders and Google Docs links cannot be displayed; the app shows initials and explains why in the profile editor.

Images use a plain `<img>` (not `next/image`): the URLs are arbitrary user-supplied hosts, so `remotePatterns` could not cover them, and the Next optimizer would add a
server-side fetch of user-chosen URLs and consume Vercel image quota. No proxy is used, so no `next.config.ts` change is needed.
