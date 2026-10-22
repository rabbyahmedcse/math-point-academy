
"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { PlusIcon, LayersIcon } from "@/components/ui/icons";
import {
  applyView,
  countByKind,
  searchResources,
  type KindFilter,
  type ResourceItem,
  type SortOrder,
} from "@/lib/resources";
import { HomeworkMaterialsHeader } from "./HomeworkMaterialsHeader";
import {
  PillSelect,
  ResourceFilterTabs,
  ResourceSearch,
  ResourceSortDropdown,
} from "./ResourceControls";
import { ResourceCard } from "./ResourceCard";
import { ResourceEmptyState } from "./ResourceStates";
import {
  DeleteResourceModal,
  ResourceFormModal,
  type BatchOption,
} from "./ResourceForm";

export function ResourceBrowser({
  items,
  mode,
  batches = [],
  subtitle,
}: {
  items: ResourceItem[];
  mode: "student" | "staff";
  batches?: BatchOption[];
  subtitle: string;
}) {
  const staff = mode === "staff";

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [sort, setSort] = useState<SortOrder>("latest");
  const [batchId, setBatchId] = useState("");

  const [form, setForm] = useState<{
    open: boolean;
    item: ResourceItem | null;
  }>({ open: false, item: null });

  const [deleting, setDeleting] = useState<ResourceItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  // Build batch options from the available resource data.
  const batchFilterOptions = useMemo(() => {
    const m = new Map<string, string>();

    for (const item of items) {
      if (item.batchId && !m.has(item.batchId)) {
        m.set(item.batchId, item.batchName);
      }
    }

    return [...m]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Counts reflect search and batch filters.
  const counts = useMemo(
    () =>
      countByKind(
        searchResources(items, {
          query: deferredQuery,
          batchId,
        }),
      ),
    [items, deferredQuery, batchId],
  );

  // Apply search, category, batch and sorting.
  const visible = useMemo(
    () =>
      applyView(items, {
        kind,
        query: deferredQuery,
        sort,
        batchId,
      }),
    [items, kind, deferredQuery, sort, batchId],
  );

  const clearAll = useCallback(() => {
    setQuery("");
    setKind("all");
    setBatchId("");
  }, []);

  const openCreate = useCallback(
    () => setForm({ open: true, item: null }),
    [],
  );

  const openEdit = useCallback(
    (item: ResourceItem) => setForm({ open: true, item }),
    [],
  );

  const closeForm = useCallback(
    () => setForm((current) => ({ ...current, open: false })),
    [],
  );

  const askDelete = useCallback((item: ResourceItem) => {
    setDeleting(item);
  }, []);

  const saved = useCallback((message: string) => {
    setForm((current) => ({ ...current, open: false }));
    setToast(message);
  }, []);

  const deleted = useCallback((message: string) => {
    setDeleting(null);
    setToast(message);
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const filtersActive =
    query !== "" || kind !== "all" || batchId !== "";

  return (
    <>
      <div className="relative isolate">
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-3 -inset-y-2 -z-10 rounded-3xl bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/70 opacity-80 blur-xl"
        />

        {/* Page heading and actions */}

{/* Heading */}
<HomeworkMaterialsHeader subtitle={subtitle} />

{/* Search + Add Resource */}
<div className="mb-6 mt-5 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
  <div className="min-w-0 flex-1">
    <ResourceSearch value={query} onChange={setQuery} />
  </div>

  {staff && (
    <button
      type="button"
      onClick={openCreate}
      disabled={batches.length === 0}
      title={
        batches.length === 0
          ? "Create or get assigned to an active batch first"
          : undefined
      }
      className="group relative inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />

      <PlusIcon className="relative h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
      <span className="relative">Add resource</span>
    </button>
  )}
</div>

      </div>

      {/* Filter toolbar */}
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl transition-shadow duration-300 hover:shadow-md sm:p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/80 to-transparent"
        />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
              <h2 className="text-sm font-bold text-slate-800">
                Browse resources
              </h2>
            </div>

            <ResourceFilterTabs
              value={kind}
              counts={counts}
              onChange={setKind}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
            {staff && batchFilterOptions.length > 1 && (
              <div className="min-w-0 sm:min-w-[190px]">
                <PillSelect
                  label="Filter by batch"
                  value={batchId}
                  onChange={setBatchId}
                  icon={<LayersIcon className="h-4 w-4" />}
                >
                  <option value="">All batches</option>
                  {batchFilterOptions.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </PillSelect>
              </div>
            )}

            <div className="min-w-0">
              <ResourceSortDropdown
                value={sort}
                onChange={setSort}
              />
            </div>

            {filtersActive && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/10"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M4 4l12 12M16 4 4 16"
                    strokeLinecap="round"
                  />
                </svg>
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Screen reader announcement */}
      <p className="sr-only" aria-live="polite">
        {visible.length}{" "}
        {visible.length === 1 ? "resource" : "resources"} shown
      </p>

      {/* Results summary */}
      {visible.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-800">
              {visible.length}
            </span>{" "}
            {visible.length === 1 ? "resource" : "resources"}
          </p>

          {staff && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-[11px] font-semibold text-indigo-700">
              <LayersIcon className="h-3.5 w-3.5" />
              Staff workspace
            </span>
          )}
        </div>
      )}

      {/* Resource list / empty state */}
      {visible.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-sm sm:p-5">
          <ResourceEmptyState
            filtered={items.length > 0 && filtersActive}
            onClear={clearAll}
          >
            {items.length === 0 && staff && batches.length > 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="group mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Add the first resource
              </button>
            )}
          </ResourceEmptyState>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((item) => (
            <ResourceCard
              key={item.id}
              item={item}
              canManage={staff}
              showBatch={staff}
              onEdit={openEdit}
              onDelete={askDelete}
            />
          ))}
        </ul>
      )}

      {/* Staff-only modals */}
      {staff && (
        <>
          <ResourceFormModal
            open={form.open}
            item={form.item}
            batches={batches}
            onClose={closeForm}
            onSaved={saved}
          />

          <DeleteResourceModal
            item={deleting}
            onClose={() => setDeleting(null)}
            onDeleted={deleted}
          />
        </>
      )}

      <Toast message={toast} onClose={closeToast} />
    </>
  );
}
