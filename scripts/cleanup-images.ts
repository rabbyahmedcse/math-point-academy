/**
 * One-off: removes any stored image DATA from the database.
 * Keeps only http(s) photo links of students; deletes every other `image` value (admins, teachers, parents, base64 uploads).
 */
import { connectDB } from "../lib/db";
import { User } from "../models/User";

async function main() {
  await connectDB();
  const a = await User.updateMany({ role: { $ne: "student" }, image: { $exists: true } }, { $unset: { image: 1 } });
  const b = await User.updateMany({ role: "student", image: { $exists: true, $not: /^https?:\/\// } }, { $unset: { image: 1 } });
  console.log(`Removed images from ${a.modifiedCount} non-student and ${b.modifiedCount} student record(s).`);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
