/** Performance rating a teacher/admin gives next to a student's marks (replaces the free-text remark). */
export const PERFORMANCE_LEVELS = [
  { value: "bad", label: "Bad", cls: "bg-red-100 text-red-700" },
  { value: "average", label: "Average", cls: "bg-slate-200 text-slate-700" },
  { value: "good", label: "Good", cls: "bg-blue-100 text-blue-700" },
  { value: "very_good", label: "Very Good", cls: "bg-emerald-100 text-emerald-700" },
  { value: "excellent", label: "Excellent", cls: "bg-purple-100 text-purple-700" },
] as const;

export const PERFORMANCE_VALUES: string[] = PERFORMANCE_LEVELS.map((p) => p.value);
export const performanceOf = (v?: string | null) => PERFORMANCE_LEVELS.find((p) => p.value === v);
export const performanceLabel = (v?: string | null) => performanceOf(v)?.label ?? "—";
