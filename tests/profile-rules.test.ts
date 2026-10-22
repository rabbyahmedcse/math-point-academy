import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProfileUpdate, PARENT_PHONE_LOCKED_MESSAGE } from "../lib/profile-rules";

const full = { name: "New Name", phone: "01811111111", address: "Dhaka", image: "https://example.com/a.jpg" };

test("PARENT: cannot change mobile number (different number is rejected, nothing is written)", () => {
  const r = buildProfileUpdate("parent", "01712345678", full);
  assert.deepEqual(r, { ok: false, error: PARENT_PHONE_LOCKED_MESSAGE });
});

test("PARENT: cannot clear the mobile number", () => {
  assert.equal(buildProfileUpdate("parent", "01712345678", { phone: "" }).ok, false);
});

test("PARENT: other formats of the SAME number are accepted but the number is never written", () => {
  for (const same of ["01712345678", "+8801712345678", "8801712345678"]) {
    const r = buildProfileUpdate("parent", "01712345678", { phone: same, name: "Mrs Rahman" });
    assert.equal(r.ok, true);
    if (r.ok) { assert.equal("phone" in r.set, false); assert.equal("phone" in r.unset, false); assert.equal(r.set.name, "Mrs Rahman"); }
  }
});

test("PARENT: name, address and image link can still be updated (no phone submitted, as the modal does)", () => {
  const r = buildProfileUpdate("parent", "01712345678", { name: "Mrs Rahman", address: "Mirpur", image: "https://x.com/p.png" });
  assert.deepEqual(r, { ok: true, set: { name: "Mrs Rahman", address: "Mirpur", image: "https://x.com/p.png" }, unset: {} });
});

test("PARENT: removing the photo only unsets image", () => {
  assert.deepEqual(buildProfileUpdate("parent", "017", { image: "" }), { ok: true, set: {}, unset: { image: 1 } });
});

for (const role of ["admin", "teacher"] as const) {
  test(`${role.toUpperCase()}: may change name, mobile, address, image`, () => {
    assert.deepEqual(buildProfileUpdate(role, "01712345678", full), { ok: true, set: { ...full }, unset: {} });
  });
  test(`${role.toUpperCase()}: empty mobile removes it`, () => {
    assert.deepEqual(buildProfileUpdate(role, "01712345678", { phone: "" }), { ok: true, set: {}, unset: { phone: 1 } });
  });
}

test("STUDENT: may change mobile, address, image — but NOT name (existing policy)", () => {
  const r = buildProfileUpdate("student", "01712345678", full);
  assert.deepEqual(r, { ok: true, set: { phone: full.phone, address: full.address, image: full.image }, unset: {} });
});

test("STUDENT: mobile cannot be emptied", () => {
  assert.deepEqual(buildProfileUpdate("student", "01712345678", { phone: "" }), { ok: false, error: "Mobile number is required." });
});

test("protected fields are never part of the update", () => {
  const r = buildProfileUpdate("admin", "017", { ...full, role: "admin", email: "x@y.z", studentId: "STU-1" } as never);
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(Object.keys(r.set).sort(), ["address", "image", "name", "phone"]);
});
