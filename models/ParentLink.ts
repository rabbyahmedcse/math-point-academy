import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * Links a parent account to ONE child. A parent only ever sees children whose link is "active".
 *  - verifiedBy "phone": parent's mobile matched the guardian mobile given at student registration
 *  - verifiedBy "staff": a teacher/admin approved a link whose phone did not match
 */
const parentLinkSchema = new Schema(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    relationship: { type: String, enum: ["father", "mother", "guardian"], required: true },
    status: { type: String, enum: ["pending", "active", "rejected"], default: "pending", index: true },
    verifiedBy: { type: String, enum: ["phone", "staff"] },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true },
);
parentLinkSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

export type ParentLinkDoc = InferSchemaType<typeof parentLinkSchema>;
export const ParentLink: Model<ParentLinkDoc> =
  (models.ParentLink as Model<ParentLinkDoc>) || model<ParentLinkDoc>("ParentLink", parentLinkSchema);
