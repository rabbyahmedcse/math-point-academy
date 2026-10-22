
"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import {
  CameraIcon,
  ChevronRightIcon,
  KeyIcon,
  LinkIcon,
  PencilIcon,
  PhoneIcon,
  PinIcon,
  UserIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { classifyImageUrl, imageProblemHint } from "@/lib/image-url";
import type { ActionState } from "@/lib/action";
import { updateProfile } from "@/actions/profile";

const idle: ActionState = { ok: false };

const PHONE_RE = /^(\+?88)?01[3-9]\d{8}$/;
const IMAGE_RE = /^https?:\/\/[^\s]+$/i;

export interface ProfileValues {
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  image: string;
}

function Input({
  id,
  label,
  icon,
  error,
  hint,
  ...rest
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="group min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-slate-700 transition-colors group-focus-within:text-indigo-700"
      >
        {label}
      </label>

      <div className="relative">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300",
            error
              ? "text-rose-400"
              : "text-slate-400 group-focus-within:scale-110 group-focus-within:text-indigo-600"
          )}
        >
          {icon}
        </span>

        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(
            "h-12 w-full min-w-0 rounded-2xl border bg-white/80 pl-12 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all duration-300",
            "placeholder:text-slate-400 hover:border-indigo-200 hover:shadow-md",
            "focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.10)]",
            "disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none",
            error
              ? "border-rose-300 focus:border-rose-400 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.08)]"
              : "border-slate-200"
          )}
          {...rest}
        />
      </div>

      {error ? (
        <p
          id={`${id}-msg`}
          className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-rose-600"
        >
          <span aria-hidden className="mt-0.5">●</span>
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-msg`}
          className="mt-2 text-xs leading-5 text-slate-500"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Profile editor modal */
export function EditProfile({
  values,
  passwordHref,
}: {
  values: ProfileValues;
  passwordHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const saved = useCallback((message: string) => {
    setOpen(false);
    setToast(message);
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <PencilIcon className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" />
        <span className="relative">Update Profile</span>
      </button>

      <Modal
        open={open}
        onClose={close}
        title="Edit Profile"
        subtitle="Update your personal information"
      >
        <EditProfileForm
          values={values}
          passwordHref={passwordHref}
          onCancel={close}
          onSaved={saved}
        />
      </Modal>

      <Toast message={toast} onClose={closeToast} />
    </>
  );
}

function EditProfileForm({
  values,
  passwordHref,
  onCancel,
  onSaved,
}: {
  values: ProfileValues;
  passwordHref: string;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const [state, formAction, pending] =
    useActionState<ActionState, FormData>(updateProfile, idle);

  const isStudent = values.role === "student";
  const isParent = values.role === "parent";

  const [name, setName] = useState(values.name);
  const [phone, setPhone] = useState(values.phone);
  const [address, setAddress] = useState(values.address);
  const [image, setImage] = useState(values.image);
  // The URL (trimmed) for which the live preview could not be loaded; reset automatically when the text changes.
  const [previewFailedFor, setPreviewFailedFor] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (state.ok) {
      onSaved(state.message ?? "Profile updated.");
    }
  }, [state, onSaved]);

  const errors = {
    name: isStudent
      ? ""
      : name.trim().length >= 2 && name.trim().length <= 80
        ? ""
        : "Enter your full name (2–80 characters).",

    phone: isParent
      ? ""
      : phone.trim() === ""
        ? isStudent
          ? "Mobile number is required."
          : ""
        : PHONE_RE.test(phone.trim())
          ? ""
          : "Enter a valid mobile number (01XXXXXXXXX).",

    address:
      address.length <= 200
        ? ""
        : "Address is too long (max 200 characters).",

    image:
      image.trim() === "" ||
      (IMAGE_RE.test(image.trim()) && image.trim().length <= 500)
        ? ""
        : "Image link must start with http:// or https://",
  };

  const invalid = Object.values(errors).some(Boolean);
  const e = (key: keyof typeof errors) => (touched ? errors[key] : "");

  // Plain-language guidance about the photo link (Drive permissions, folders, unloadable images).
  const imageKind = classifyImageUrl(image);
  const previewFailed = image.trim() !== "" && previewFailedFor === image.trim();
  const imageNote = previewFailed || imageKind === "drive-other"
    ? imageProblemHint(image)
    : imageKind === "drive-file"
      ? "Google Drive link detected. The file must be shared as “Anyone with the link” (Viewer) for the photo to show."
      : "";

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        setTouched(true);
        if (invalid) event.preventDefault();
      }}
      noValidate
      className="relative"
    >
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-3 top-0 h-36 w-36 rounded-full bg-violet-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-4 left-0 h-32 w-32 rounded-full bg-indigo-200/30 blur-3xl"
      />

      <div className="relative grid gap-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
        {/* Profile image card */}
        <div className="flex flex-col items-center">
          <div className="group relative w-full max-w-56 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-100/80 p-5 shadow-lg shadow-indigo-950/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 sm:max-w-none">
            <div
              aria-hidden
              className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-200/50 blur-2xl"
            />

            <div className="relative flex flex-col items-center gap-3">
              <div className="relative rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-1 shadow-xl shadow-indigo-500/20 transition-transform duration-500 group-hover:rotate-2 group-hover:scale-[1.03]">
                <Avatar
                  name={name || values.name}
                  image={image.trim()}
                  size="h-28 w-28 text-4xl border-4 border-white"
                  onFail={() => setPreviewFailedFor(image.trim())}
                />

                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-2xl border-[3px] border-white bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg"
                >
                  <CameraIcon className="h-4 w-4" />
                </span>
              </div>

              <div className="min-w-0 text-center">
                <p className="break-words text-sm font-extrabold text-slate-800">
                  {name.trim() || values.name || "Your Name"}
                </p>
                <p className="mt-1 text-xs font-medium capitalize text-indigo-600">
                  {values.role}
                </p>
              </div>

              <div className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Profile preview
              </div>
            </div>
          </div>

          <p className="mt-3 max-w-56 text-center text-xs leading-5 text-slate-500">
            Paste an image link to personalize your profile photo. Google Drive share links work too.
          </p>
        </div>

        {/* Profile fields */}
        <div className="min-w-0 space-y-4">
          <div className="mb-1">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">
              Personal Information
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Keep your account details accurate and up to date.
            </p>
          </div>

          <Input
            id="pf-name"
            name={isStudent ? undefined : "name"}
            label="Full Name"
            icon={<UserIcon className="h-5 w-5" />}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isStudent}
            maxLength={80}
            autoComplete="name"
            error={e("name")}
            hint={
              isStudent
                ? "Ask the coaching center to correct your name."
                : undefined
            }
          />

          <Input
            id="pf-phone"
            name={isParent ? undefined : "phone"}
            label="Mobile Number"
            icon={<PhoneIcon className="h-5 w-5" />}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={isParent}
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            error={e("phone")}
            hint={
              isParent
                ? "Your registered number links your children, so it can’t be changed here. Contact the coaching center if it needs to change."
                : undefined
            }
          />

          <Input
            id="pf-address"
            name="address"
            label="Address"
            icon={<PinIcon className="h-5 w-5" />}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            maxLength={200}
            autoComplete="street-address"
            error={e("address")}
          />

          <Input
            id="pf-image"
            name="image"
            label="Image URL"
            icon={<LinkIcon className="h-5 w-5" />}
            value={image}
            onChange={(event) => setImage(event.target.value)}
            type="url"
            inputMode="url"
            maxLength={500}
            placeholder="https://example.com/image.jpg"
            error={e("image")}
            hint="Leave empty to remove your photo."
          />
          {imageNote && (
            <p role="status" className="-mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              {imageNote}
            </p>
          )}
        </div>
      </div>

      {/* Server-side error */}
      {state.message && !state.ok && (
        <p
          role="alert"
          className="relative mt-5 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium leading-6 text-rose-700 shadow-sm"
        >
          {state.message}
        </p>
      )}

      {/* Footer actions */}
      <div className="relative mt-7 border-t border-slate-200/80 pt-5">
        <Link
          href={passwordHref}
          className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-violet-50/90 px-4 py-3 text-sm font-bold text-indigo-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:w-fit sm:min-w-56"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
              <KeyIcon className="h-4 w-4" />
            </span>
            <span>Change Password</span>
          </span>

          <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={pending}
            className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-7 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative">
              {pending ? "Saving…" : "Save Changes"}
            </span>

            {!pending && (
              <ChevronRightIcon className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
