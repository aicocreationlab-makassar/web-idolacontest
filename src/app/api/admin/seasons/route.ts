import { z } from "zod";
import { readJson } from "@/lib/request-body";
import { admin } from "@/lib/supabase/server";
import { failure, json, sameOrigin } from "@/lib/http";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal dari kalender.");

const inputSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update_dates"),
    seasonId: z.uuid(),
    openDate: date,
    closeDate: date,
  }),
  z.object({
    action: z.literal("create"),
    name: z.string().trim().min(2).max(80),
    openDate: date,
    closeDate: date,
  }),
]);

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = inputSchema.parse(await readJson(request));
    if (input.openDate > input.closeDate)
      throw new Error("Data tanggal tutup harus sama atau setelah tanggal buka.");

    const { db } = await admin(["super_admin"]);
    const result =
      input.action === "update_dates"
        ? await db.rpc("update_active_season_dates", {
            p_season_id: input.seasonId,
            p_open_date: input.openDate,
            p_close_date: input.closeDate,
          })
        : await db.rpc("create_next_season", {
            p_name: input.name,
            p_open_date: input.openDate,
            p_close_date: input.closeDate,
          });
    if (result.error)
      throw new Error("Data season belum dapat disimpan. Periksa nama dan tanggalnya.");

    return json({
      ok: true,
      seasonId: input.action === "create" ? result.data : input.seasonId,
    });
  } catch (error) {
    return failure(error);
  }
}
