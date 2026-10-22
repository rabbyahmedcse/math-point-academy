
import { ResourceBrowser } from "@/components/features/resources/ResourceBrowser";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { batchesFor } from "@/lib/access";
import { loadResources } from "@/lib/resource-data";

/** Homework & materials management — shared by admin (all batches) and teacher (own batches only). */
export default async function MaterialsPage() {
  const user = await requireRole(["admin", "teacher"]);

  await connectDB();

  const [items, activeBatches] = await Promise.all([
    loadResources(user),
    batchesFor(user),
  ]);

  return (
    <main className="relative isolate min-w-0 space-y-6 pb-8">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-0 -z-10 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-64 -z-10 h-56 w-56 rounded-full bg-violet-200/20 blur-3xl"
      />

      {/* Resource management */}
      <section className="min-w-0 rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-indigo-500/[0.04] sm:p-5 lg:p-6">
        <ResourceBrowser
          mode="staff"
          items={items}
          batches={activeBatches.map((b) => ({
            id: String(b._id),
            name: b.name,
          }))}
          subtitle="Share, schedule and manage homework, quizzes and study materials for your batches."
        />
      </section>
    </main>
  );
}
