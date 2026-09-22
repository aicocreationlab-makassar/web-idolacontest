import "server-only";
import { z } from "zod";
export type Region = { id: string; name: string };
export const levels = [
  "provinces",
  "regencies",
  "districts",
  "villages",
] as const;
export async function regions(level: string, parent = ""): Promise<Region[]> {
  if (
    !levels.includes(level as (typeof levels)[number]) ||
    (parent && !/^\d{2,12}(?:\.\d{2,4}){0,3}$/.test(parent))
  )
    throw new Error("Wilayah tidak valid.");
  if (level !== "provinces" && !parent) return [];
  const base =
    process.env.REGION_API_BASE_URL ||
    "https://www.emsifa.com/api-wilayah-indonesia/v2";
  const response = await fetch(
    `${base.replace(/\/$/, "")}/${level}${parent ? `/${parent}` : ""}.json`,
    { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) throw new Error("Wilayah belum dapat dimuat. Coba lagi.");
  const list = z.array(z.object({ id: z.string(), name: z.string() }));
  const result = z
    .union([list, z.object({ data: list })])
    .parse(await response.json());
  return Array.isArray(result) ? result : result.data;
}
export async function validateRegions(data: Record<string, unknown>) {
  let parent = "";
  for (const [level, key] of [
    ["provinces", "province"],
    ["regencies", "regency"],
    ["districts", "district"],
    ["villages", "village"],
  ]) {
    const list = await regions(level, parent);
    const item = list.find((v) => v.id === data[`${key}_code`]);
    if (!item) throw new Error("Wilayah tidak cocok. Pilih ulang alamat.");
    data[`${key}_name`] = item.name;
    parent = item.id;
  }
}
