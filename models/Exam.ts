import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PERFORMANCE_VALUES } from "@/lib/performance";

const resultSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    marks: { type: Number, min: 0, default: null },
    performance: { type: String, enum: ["", ...PERFORMANCE_VALUES], default: "" },
  },
  { _id: false },
);

const auditSchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    by: Schema.Types.ObjectId,
    byName: String,
    action: String,
    detail: String,
  },
  { _id: false },
);

const examSchema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, default: "" },
    fullMarks: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["scheduled", "cancelled"], default: "scheduled" },
    results: [resultSchema],
    // draft -> (pending admin approval) -> published. Students only ever see "published".
    publishStatus: { type: String, enum: ["draft", "pending", "published"], default: "draft", index: true },
    publishedAt: Date,
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    audit: [auditSchema],
  },
  { timestamps: true },
);

export type ExamDoc = InferSchemaType<typeof examSchema>;
export const Exam: Model<ExamDoc> =
  (models.Exam as Model<ExamDoc>) || model<ExamDoc>("Exam", examSchema);
