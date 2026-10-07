export type ParticipantAgeUnit = "years" | "months";

/** Renders an age stored with its original unit, without exposing private data. */
export function formatParticipantAge(
  age: number | string | null | undefined,
  unit: string | null | undefined,
) {
  if (age === null || age === undefined || age === "") return "—";
  return `${age} ${unit === "months" ? "bulan" : "tahun"}`;
}
