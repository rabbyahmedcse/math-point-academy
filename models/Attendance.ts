import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ATTENDANCE_STATUS = ["present", "absent", "late"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];

const recordSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ATTENDANCE_STATUS, required: true },
    note: String,
  },
  { _id: false },
);

/** Every correction is appended here so important changes are never silent (Requirements §5.3). */
const historySchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: "User" },
    byName: String,
    changes: [{ studentId: Schema.Types.ObjectId, from: String, to: String, _id: false }],
  },
  { _id: false },
);

const attendanceSchema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD in the coaching's timezone
    records: [recordSchema],
    takenBy: { type: Schema.Types.ObjectId, ref: "User" },
    history: [historySchema],
  },
  { timestamps: true },
);
attendanceSchema.index({ batchId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ "records.studentId": 1 });

export type AttendanceDoc = InferSchemaType<typeof attendanceSchema>;
export const Attendance: Model<AttendanceDoc> =
  (models.Attendance as Model<AttendanceDoc>) || model<AttendanceDoc>("Attendance", attendanceSchema);
