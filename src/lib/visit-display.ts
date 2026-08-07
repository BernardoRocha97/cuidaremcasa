export function interventionsLabel(
  interventions: { interventionType: { name: string } }[],
  fallback = "—"
) {
  if (interventions.length === 0) return fallback;
  return interventions.map((i) => i.interventionType.name).join(", ");
}
