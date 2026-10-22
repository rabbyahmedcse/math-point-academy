
"use client";

import { useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/action";
import {
  RESOURCE_KINDS,
  isSafeHttpUrl,
  type ResourceItem,
  type ResourceKind,
} from "@/lib/resources";
import {
  CalendarIcon,
  CheckIcon,
  FileTextIcon,
  LayersIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { createMaterial, deleteMaterial, updateMaterial } from "@/actions/materials";

const idle: ActionState = { ok: false };

const KIND_OPTION: Record<ResourceKind, string> = {
  homework: "Homework",
  quiz: "Quiz",
  material: "Study material",
};

export interface BatchOption {
  id: string;
  name: string;
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      {children}

      {error ? (
        <p
          id={`${id}-msg`}
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium leading-5 text-rose-600"
        >
          <span aria-hidden="true" className="mt-0.5 shrink-0">
            !
          </span>
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-msg`}
          className="mt-1.5 text-xs leading-5 text-slate-500"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputBase =
  "input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60";

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
        {number}
      </span>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/** Create or edit a resource. Server actions re-check authorization. */
export function ResourceFormModal({
  open,
  item,
  batches,
  defaultBatchId,
  onClose,
  onSaved,
}: {
  open: boolean;
  item: ResourceItem | null;
  batches: BatchOption[];
  defaultBatchId?: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const editing = !!item;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit resource" : "Add homework or material"}
      subtitle={
        editing
          ? "Update the details students see."
          : "Share homework, a quiz or study material with a batch."
      }
    >
      <ResourceFormBody
        key={item?.id ?? "new"}
        item={item}
        batches={batches}
        defaultBatchId={defaultBatchId}
        onClose={onClose}
        onSaved={onSaved}
      />
    </Modal>
  );
}

function ResourceFormBody({
  item,
  batches,
  defaultBatchId,
  onClose,
  onSaved,
}: {
  item: ResourceItem | null;
  batches: BatchOption[];
  defaultBatchId?: string;
  onClose: () => void;
  onSaved: (m: string) => void;
}) {
  const editing = !!item;

  const [state, formAction, pending] = useActionState<
    ActionState,
    FormData
  >(editing ? updateMaterial : createMaterial, idle);

  const [batchId, setBatchId] = useState(
    item?.batchId ??
      defaultBatchId ??
      (batches.length === 1 ? batches[0].id : ""),
  );

  const [kind, setKind] = useState<ResourceKind>(
    item?.kind ?? "homework",
  );

  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [publishDate, setPublishDate] = useState(item?.publishDate ?? "");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (state.ok) {
      onSaved(state.message ?? "Saved.");
    }
  }, [state, onSaved]);

  const errors = {
    batch: batchId ? "" : "Select a batch.",
    title:
      title.trim().length >= 2
        ? ""
        : "Enter a title (at least 2 characters).",
    url:
      url.trim() === "" || isSafeHttpUrl(url.trim())
        ? ""
        : "Link must start with http:// or https://",
  };

  const invalid = Object.values(errors).some(Boolean);
  const show = (k: keyof typeof errors) => (touched ? errors[k] : "");

  const inputCls = (k: keyof typeof errors) =>
    cn(inputBase, show(k) && "!border-rose-400 focus:!ring-rose-100");

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        setTouched(true);
        if (invalid) e.preventDefault();
      }}
      noValidate
      className="space-y-6"
    >
      {/* Edit identifier */}
      {editing && <input type="hidden" name="id" value={item.id} />}

      {/* Resource information */}
      <section>
        <SectionHeading
          number="01"
          title="Resource information"
          description="Choose the batch and resource type."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="rf-batch" label="Batch *" error={show("batch")}>
            <select
              id="rf-batch"
              name="batchId"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              required
              aria-invalid={!!show("batch")}
              aria-describedby={show("batch") ? "rf-batch-msg" : undefined}
              className={cn(inputCls("batch"), "cursor-pointer")}
            >
              <option value="" disabled>
                Select a batch…
              </option>

              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>

          <Field id="rf-kind" label="Type *">
            <select
              id="rf-kind"
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as ResourceKind)}
              className={cn(inputBase, "cursor-pointer")}
            >
              {RESOURCE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_OPTION[k]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Title and description */}
      <section>
        <SectionHeading
          number="02"
          title="Content and instructions"
          description="Give students a clear title and helpful details."
        />

        <div className="space-y-4">
          <Field id="rf-title" label="Title *" error={show("title")}>
            <input
              id="rf-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
              aria-invalid={!!show("title")}
              aria-describedby={show("title") ? "rf-title-msg" : undefined}
              className={inputCls("title")}
              placeholder="e.g. Algebra worksheet 3"
            />

            <p className="mt-1 text-right text-[11px] text-slate-400">
              {title.length}/150
            </p>
          </Field>

          <Field
            id="rf-desc"
            label="Description"
            hint="Optional — instructions or a short note for students."
          >
            <textarea
              id="rf-desc"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              aria-describedby="rf-desc-msg"
              className={cn(inputBase, "min-h-24 resize-y leading-6")}
              placeholder="Add instructions, topics, deadlines or other useful details..."
            />

            <p className="mt-1 text-right text-[11px] text-slate-400">
              {description.length}/2000
            </p>
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Link and publishing */}
      <section>
        <SectionHeading
          number="03"
          title="Resource link and schedule"
          description="Attach learning materials and choose when to publish."
        />

        <div className="space-y-4">
          <Field
            id="rf-url"
            label="Link (Drive / PDF / image / video / quiz form)"
            hint="Paste a web link that starts with https://. Leave empty if there is nothing to open."
            error={show("url")}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M8 12 12 8m-6.5 7.5a3 3 0 0 1 0-4.2l2-2a3 3 0 0 1 4.2 0m.8-2.8 1.2-1.2a3 3 0 0 1 4.2 4.2l-2 2a3 3 0 0 1-4.2 0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <input
                id="rf-url"
                name="url"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                maxLength={1000}
                aria-invalid={!!show("url")}
                aria-describedby="rf-url-msg"
                className={cn(inputCls("url"), "pl-10")}
                placeholder="https://…"
              />
            </div>
          </Field>

          <Field
            id="rf-date"
            label="Publish date"
            hint="Optional. Leave empty to publish now. A future date keeps it hidden from students until that day (shown as Scheduled)."
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-indigo-500">
                <CalendarIcon className="h-4 w-4" />
              </span>

              <input
                id="rf-date"
                name="publishDate"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                aria-describedby="rf-date-msg"
                className={cn(inputBase, "pl-10 sm:max-w-64")}
              />
            </div>
          </Field>
        </div>
      </section>

      {/* Server action error */}
      {state.message && !state.ok && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50/60 p-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="7.5" />
              <path d="M10 6v4m0 3h.01" strokeLinecap="round" />
            </svg>
          </span>

          <p className="pt-1 text-sm leading-6 text-rose-800">
            {state.message}
          </p>
        </div>
      )}

      {/* Form actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={pending}
          className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {editing ? "Saving…" : "Publishing…"}
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              {editing ? "Save changes" : "Publish resource"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function DeleteResourceModal({
  item,
  onClose,
  onDeleted,
}: {
  item: ResourceItem | null;
  onClose: () => void;
  onDeleted: (m: string) => void;
}) {
  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title="Delete this resource?"
      subtitle="This removes it for everyone and cannot be undone."
      className="max-w-md"
    >
      {item && (
        <DeleteBody
          item={item}
          onClose={onClose}
          onDeleted={onDeleted}
        />
      )}
    </Modal>
  );
}

function DeleteBody({
  item,
  onClose,
  onDeleted,
}: {
  item: ResourceItem;
  onClose: () => void;
  onDeleted: (m: string) => void;
}) {
  const [state, formAction, pending] = useActionState<
    ActionState,
    FormData
  >(deleteMaterial, idle);

  useEffect(() => {
    if (state.ok) {
      onDeleted(state.message ?? "Deleted.");
    }
  }, [state, onDeleted]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={item.id} />

      <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 to-orange-50/50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <TrashIcon className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-rose-600">
              Resource to delete
            </p>

            <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-800">
              {item.title}
            </p>

            <p className="mt-2 text-xs leading-5 text-rose-800">
              This action cannot be undone. The resource will be removed for
              everyone who can access it.
            </p>
          </div>
        </div>
      </div>

      {state.message && !state.ok && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
        >
          Keep resource
        </button>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Deleting…
            </>
          ) : (
            <>
              <TrashIcon className="h-4 w-4" />
              Delete resource
            </>
          )}
        </button>
      </div>
    </form>
  );
}
