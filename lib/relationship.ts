export const RELATIONSHIPS = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "guardian", label: "Other Guardian" },
] as const;
export const relationshipLabel = (v?: string | null) => RELATIONSHIPS.find((r) => r.value === v)?.label ?? "Guardian";
