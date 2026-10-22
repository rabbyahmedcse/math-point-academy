import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Atomic sequence counters: `student-2026`, `receipt-2026`. */
const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } }, { versionKey: false });
export const Counter: Model<InferSchemaType<typeof counterSchema>> =
  (models.Counter as Model<InferSchemaType<typeof counterSchema>>) || model("Counter", counterSchema);

/** Important-activity history (Requirements §4.1 System Control, §9). */
const auditSchema = new Schema({
  at: { type: Date, default: Date.now, index: true },
  actorId: Schema.Types.ObjectId,
  actorName: String,
  action: { type: String, required: true },
  entity: String,
  entityId: String,
  detail: String,
});
export const AuditLog: Model<InferSchemaType<typeof auditSchema>> =
  (models.AuditLog as Model<InferSchemaType<typeof auditSchema>>) || model("AuditLog", auditSchema);

const settingsSchema = new Schema({
  _id: { type: String, default: "main" },
  coachingName: { type: String, default: "Math Point Academy" },
  facebookUrl: { type: String, default: "" },
  logoUrl: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
});
export const Settings: Model<InferSchemaType<typeof settingsSchema>> =
  (models.Settings as Model<InferSchemaType<typeof settingsSchema>>) || model("Settings", settingsSchema);

/**
 * Homework / quizzes / study materials per batch.
 * Backward-compatible additions: kind may also be "quiz"; optional `publishAt` = publish/scheduled date
 * (absent on every existing record => published, dated by createdAt). Students never see a future publishAt.
 */
const materialSchema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    kind: { type: String, enum: ["homework", "quiz", "material"], default: "material" },
    url: { type: String, default: "" },
    publishAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdByName: String,
  },
  { timestamps: true },
);
export const Material: Model<InferSchemaType<typeof materialSchema>> =
  (models.Material as Model<InferSchemaType<typeof materialSchema>>) || model("Material", materialSchema);
