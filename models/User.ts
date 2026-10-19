import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ROLES = ["admin", "teacher", "student", "parent"] as const;
export const USER_STATUS = ["pending", "active", "rejected", "inactive"] as const;
export type Role = (typeof ROLES)[number];
export type UserStatus = (typeof USER_STATUS)[number];

/** Admin-controlled switches for a teacher (Requirements §4.2, §9). */
const permissionsSchema = new Schema(
  {
    manageBatches: { type: Boolean, default: true },
    approveStudents: { type: Boolean, default: true },
    feeEntry: { type: Boolean, default: true },
    noticeAll: { type: Boolean, default: false },
  },
  { _id: false },
);
export type PermissionKey = keyof InferSchemaType<typeof permissionsSchema>;

/**
 * IMPORTANT: this maps onto the SAME `user` collection Better Auth uses.
 * Better Auth owns: name, email, emailVerified, image, username, displayUsername,
 * role, status, studentId, createdAt, updatedAt. Everything else is our domain data
 * and is written through Mongoose. Never store passwords here — Better Auth keeps
 * the scrypt hash in the `account` collection.
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    image: String,
    username: { type: String, lowercase: true, sparse: true, unique: true },
    displayUsername: String,

    role: { type: String, enum: ROLES, default: "student", index: true },
    status: { type: String, enum: USER_STATUS, default: "pending", index: true },
    mustChangePassword: { type: Boolean, default: false },

    // student fields
    studentId: { type: String, unique: true, sparse: true },
    className: String,
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", default: null, index: true },
    monthlyFee: { type: Number, min: 0 }, // optional per-student override of batch fee
    guardianName: String,
    guardianPhone: String,
    address: String,
    rejectionReason: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,

    // shared
    phone: String,

    // teacher only
    permissions: { type: permissionsSchema, default: () => ({}) },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: "user" },
);

// Duplicate-registration guard: one student account per phone number.
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { role: "student", phone: { $type: "string" } } },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);
