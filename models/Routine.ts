import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * kind = "weekly": repeats on `dayOfWeek` (0=Sun). Single dates can be skipped via `skipDates`.
 * kind = "oneoff": happens once on `date` (extra class, or the target of a reschedule).
 * Cancelling one date of a weekly class adds it to skipDates and creates a "cancelled" one-off
 * so students still see the cancellation on that day.
 */
const routineSchema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    kind: { type: String, enum: ["weekly", "oneoff"], required: true },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    date: { type: String, index: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: ["scheduled", "cancelled"], default: "scheduled" },
    note: { type: String, default: "" },
    skipDates: [String],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export type RoutineDoc = InferSchemaType<typeof routineSchema>;
export const Routine: Model<RoutineDoc> =
  (models.Routine as Model<RoutineDoc>) || model<RoutineDoc>("Routine", routineSchema);
