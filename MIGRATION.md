# Migration report: Python/FastAPI -> Next.js + Node.js

## What the audit found
- `python-api/main.py` (78 lines) was an **optional, read-only** reporting service with two endpoints. Nothing in the Next.js app called it:
  `lib/python-api.ts#pythonFetch` had **zero callers**, and no page/action referenced `localhost:8000` or `PYTHON_API_URL` except that file and `.env.example`.
- All features listed in the brief (auth, roles, batches, routines, attendance, exams, fees, parents, profiles, notices) were already implemented in Next.js and were **not touched**.

## Endpoint mapping
| FastAPI | Replacement | Notes |
|---|---|---|
| `GET /reports/attendance?batch_id&month` | `GET /api/reports/attendance?batch_id&month` | Same params, same row shape. Teacher must teach the batch (403 otherwise), 404 unknown batch. |
| `GET /reports/fees?month` | `GET /api/reports/fees?month` | Same shape/keys. Teachers: own batches (active or not), as before. |

Auth: the Python service asked Next.js to validate the cookie over HTTP; the Route Handlers call `getCurrentUser()` directly (Better Auth session + fresh MongoDB role/status check). Errors keep FastAPI's `{detail}` shape.

### Intentional, minor behaviour differences
1. Query validation is stricter: `month` must be `YYYY-MM`, `batch_id` a 24-hex id (422 instead of a Python 500/regex-injection risk).
2. A signed-in but inactive account gets 401 (Python: 403).
3. Default fee-report month uses `APP_TIMEZONE` (Asia/Dhaka) instead of the Python server's clock.
4. Percent rounding at exactly x.5 (e.g. 1/8 = 12.5%): Python rounded half-to-even (12), JS rounds half-up (13) - identical to how the rest of the app already computes percentages.
5. Attendance rows are ordered by first appearance in date order (Python: unspecified DB order).

## Performance changes (Fees page, Admin Profile -> Fees)
Found by code reading:
- No `loading.tsx` anywhere -> navigation showed nothing until the whole server render finished. Added role-level `loading.tsx` (shell stays, content area shows a skeleton).
- Fees page ran the current-month ledger **twice** and fetched the month's Fee docs **twice**, with ~7 dependent MongoDB round-trips in sequence. Now: one ledger load (also returns the Fee docs), the all-months aggregate runs in parallel with it, and the ledger is reused when the selected month is the current month (~4 dependent round-trips). Results are identical; data is still fetched fresh on every request (no caching added).
- Not changed (deliberately): per-request `getSession` + user re-read (needed for instant deactivation), separate mongoose / native-driver pools (Better Auth adapter requirement).
**These improvements are not benchmarked** - there was no database in the build environment. Measure on your deployment.

## Files
Created: `app/api/reports/{attendance,fees}/route.ts`, `lib/reports.ts`, `lib/report-calc.ts`, `tests/report-calc.test.ts`, `components/ui/PageSkeleton.tsx`, `app/dashboard/{admin,teacher,student,parent}/loading.tsx`, `MIGRATION.md`.
Modified: `lib/stats.ts`, `components/features/FeesPage.tsx`, `.env.example`, `tsconfig.json`, `package.json` (+`test` script), `.gitignore`, `README.md`.
Removed: `python-api/` (3 files), `lib/python-api.ts`, `PYTHON_API_URL`.
No schema, collection, dependency, or data changes; `package-lock.json` untouched.

## Verification status
Passed: unit tests (6/6, `lib/report-calc.ts`); parity run of the original Python loops vs TS on 2,000 random cases (0 fee mismatches, 0 attendance count/order mismatches, 167 of 11,593 percent values differ only at exact .5); no remaining references to the Python API outside comments/docs.
**NOT run** (sandbox had no network, `npm ci` failed): `next build`, `tsc --noEmit`, lint (none configured), tests of the Route Handlers against a real MongoDB/Better Auth session, and the UI. Run `npm ci && npm run typecheck && npm test && npm run build` before deploying.

## Can the Python backend be deleted?
Yes - nothing depended on it, and both endpoints now exist in Node. It has been removed from the project.
