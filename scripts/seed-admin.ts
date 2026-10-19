/**
 * One-time, secure bootstrap of the FIRST admin (Requirements §3.2 / §10 step 1).
 *   npm run seed:admin      (reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from .env.local)
 * Nobody can create an admin from the UI or the public API; delete ADMIN_PASSWORD afterwards.
 */
import { connectDB } from "../lib/db";
import { createCredentialUser } from "../lib/users";
import { User } from "../models/User";

async function main() {
  const { ADMIN_NAME = "Owner", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
  if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  await connectDB();
  if (await User.exists({ role: "admin" })) {
    console.log("An admin already exists — nothing to do.");
    return;
  }
  await createCredentialUser({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "admin", status: "active" });
  console.log(`Admin created: ${ADMIN_EMAIL}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
