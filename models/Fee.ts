import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const PAYMENT_METHODS = ["cash", "bkash", "nagad", "rocket", "bank", "other"] as const;
export type FeeStatus = "paid" | "partial" | "due";

const paymentSchema = new Schema({
  amount: { type: Number, required: true, min: 1 },
  date: { type: String, required: true }, // YYYY-MM-DD
  method: { type: String, enum: PAYMENT_METHODS, default: "cash" },
  receiptNo: { type: String, required: true },
  note: { type: String, default: "" },
  enteredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  enteredByName: String,
  // Payments are never hard-deleted. Admin can void with a reason (audit trail).
  voided: { type: Boolean, default: false },
  voidedBy: { type: Schema.Types.ObjectId, ref: "User" },
  voidedAt: Date,
  voidReason: String,
});

/** One document per student per month. */
const feeSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    amountDue: { type: Number, required: true, min: 0 },
    paidTotal: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["paid", "partial", "due"], default: "due" },
    payments: [paymentSchema],
  },
  { timestamps: true },
);
feeSchema.index({ studentId: 1, month: 1 }, { unique: true });

export type FeeDoc = InferSchemaType<typeof feeSchema>;
export const Fee: Model<FeeDoc> = (models.Fee as Model<FeeDoc>) || model<FeeDoc>("Fee", feeSchema);

export function feeStatus(paid: number, due: number): FeeStatus {
  if (due > 0 && paid >= due) return "paid";
  if (paid > 0) return "partial";
  return "due";
}
