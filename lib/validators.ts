import { z } from "zod";
import { PAYMENT_METHODS } from "@/models/Fee";
import { RESOURCE_KINDS, isSafeHttpUrl } from "./resources";

const str = (label: string, min = 1) => z.string().trim().min(min, `${label} is required`);
const phone = z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
const time = z.string().regex(/^\d{2}:\d{2}$/, "Invalid time");
const password = z.string().min(8, "Password must be at least 8 characters").max(128);

export const registerSchema = z
  .object({
    name: str("Full name", 2),
    email: z.string().trim().email("Enter a valid email"),
    phone,
    className: str("Class"),
    guardianName: str("Guardian name"),
    guardianPhone: phone,
    address: z.string().trim().optional(),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const relationship = z.enum(["father", "mother", "guardian"], { message: "Select your relationship with the student" });
const childStudentId = z.string().trim().toUpperCase().regex(/^STU-\d{4}-\d{4,}$/, "Enter a valid Student ID, e.g. STU-2026-0001");

export const parentRegisterSchema = z
  .object({
    name: str("Parent full name", 2),
    email: z.string().trim().email("Enter a valid email"),
    phone,
    relationship,
    studentId: childStudentId,
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80).optional(),
  phone: phone.optional().or(z.literal("")),
  address: z.string().trim().max(200).optional(),
  // Student photo: a link only (nothing is uploaded or stored). http(s) only — blocks javascript:/data: URLs.
  image: z.string().trim().max(500).refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Photo link must start with http:// or https://").optional(),
});

export const teacherCreateSchema = z.object({
  name: str("Name", 2),
  email: z.string().trim().email(),
  phone: phone.optional().or(z.literal("")),
  password,
});
export const teacherUpdateSchema = z.object({ id: str("Id"), name: str("Name", 2), phone: z.string().trim().optional() });

export const batchSchema = z.object({
  name: str("Batch name", 2),
  className: str("Class"),
  subject: str("Subject"),
  description: z.string().trim().optional(),
  monthlyFee: z.coerce.number().min(0, "Fee cannot be negative"),
});

export const feeSchema = z.object({
  studentId: str("Student"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date,
  method: z.enum(PAYMENT_METHODS),
  note: z.string().trim().optional(),
});

export const noticeSchema = z.object({
  title: str("Title", 3),
  body: str("Details", 3),
  audience: z.enum(["all", "batches", "teachers"]),
  publishDate: date.optional().or(z.literal("")),
  expiresAt: date.optional().or(z.literal("")),
  attachmentUrl: z.string().trim().url("Attachment must be a valid URL").optional().or(z.literal("")),
});

export const routineSchema = z
  .object({
    batchId: str("Batch"),
    kind: z.enum(["weekly", "oneoff"]),
    dayOfWeek: z.coerce.number().min(0).max(6).optional(),
    date: date.optional().or(z.literal("")),
    startTime: time,
    endTime: time,
    subject: str("Subject"),
    location: z.string().trim().optional(),
    teacherId: z.string().optional(),
    force: z.string().optional(),
  })
  .refine((d) => d.endTime > d.startTime, { message: "End time must be after start time", path: ["endTime"] })
  .refine((d) => (d.kind === "weekly" ? d.dayOfWeek !== undefined : !!d.date), { message: "Pick a weekday or a date" });

export const examSchema = z.object({
  batchId: str("Batch"),
  name: str("Exam name", 2),
  subject: str("Subject"),
  date,
  startTime: time.optional().or(z.literal("")),
  fullMarks: z.coerce.number().int().min(1, "Full marks must be at least 1"),
});

export const materialSchema = z.object({
  batchId: str("Batch"),
  title: str("Title", 2).max(150, "Title is too long (max 150 characters)"),
  description: z.string().trim().max(2000, "Description is too long (max 2000 characters)").optional(),
  kind: z.enum(RESOURCE_KINDS, { message: "Select a type" }),
  // http(s) only — zod's .url() alone would also accept javascript: / data: / file: links.
  url: z.string().trim().max(1000).refine((v) => v === "" || isSafeHttpUrl(v), "Link must start with http:// or https://").optional(),
  // Optional publish / scheduled date (YYYY-MM-DD). A future date hides the item from students until that day.
  publishDate: date.optional().or(z.literal("")),
});
export const materialUpdateSchema = materialSchema.extend({ id: str("Resource") });

export const settingsSchema = z.object({
  coachingName: str("Coaching name", 2),
  facebookUrl: z.string().trim().max(300).refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Facebook link must start with http:// or https://").optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});
