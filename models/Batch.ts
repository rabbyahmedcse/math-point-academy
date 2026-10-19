import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const batchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    className: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    teacherIds: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    monthlyFee: { type: Number, default: 0, min: 0 },
    // Batches are deactivated, never deleted, so attendance/fee history stays intact.
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export type BatchDoc = InferSchemaType<typeof batchSchema>;
export const Batch: Model<BatchDoc> =
  (models.Batch as Model<BatchDoc>) || model<BatchDoc>("Batch", batchSchema);
