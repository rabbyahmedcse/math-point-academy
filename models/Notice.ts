import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    audience: { type: String, enum: ["all", "batches", "teachers"], required: true },
    batchIds: [{ type: Schema.Types.ObjectId, ref: "Batch" }],
    publishDate: { type: Date, default: Date.now },
    expiresAt: Date,
    attachmentUrl: String, // link to a PDF/image (file upload can be added later)
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdByName: String,
    createdByRole: { type: String, enum: ["admin", "teacher"] },
  },
  { timestamps: true },
);
noticeSchema.index({ audience: 1, batchIds: 1, publishDate: -1 });

export type NoticeDoc = InferSchemaType<typeof noticeSchema>;
export const Notice: Model<NoticeDoc> =
  (models.Notice as Model<NoticeDoc>) || model<NoticeDoc>("Notice", noticeSchema);
