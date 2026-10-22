import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const noticeReadSchema = new Schema({
  noticeId: { type: Schema.Types.ObjectId, ref: "Notice", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  readAt: { type: Date, default: Date.now },
}, { timestamps: true });

noticeReadSchema.index({ noticeId: 1, userId: 1 }, { unique: true });
noticeReadSchema.index({ userId: 1, readAt: -1 });

export type NoticeReadDoc = InferSchemaType<typeof noticeReadSchema>;
export const NoticeRead: Model<NoticeReadDoc> =
  (models.NoticeRead as Model<NoticeReadDoc>) || model<NoticeReadDoc>("NoticeRead", noticeReadSchema);
