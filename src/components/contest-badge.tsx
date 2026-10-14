import { Camera, Paintbrush } from "lucide-react";

/** Colour-coded contest label so parents and admins never mix up the two contests. */
export function ContestBadge({
  type,
  label,
  large = false,
}: {
  type: string;
  label?: string;
  large?: boolean;
}) {
  const coloring = type === "coloring";
  const Icon = coloring ? Paintbrush : Camera;
  return (
    <span
      className={`contest-badge ${coloring ? "coloring" : "photogenic"}${large ? " large" : ""}`}
    >
      <Icon aria-hidden="true" />
      {label ?? (coloring ? "Lomba Mewarnai" : "Lomba Fotogenik")}
    </span>
  );
}
