import { z } from "zod";
import { admin } from "@/lib/supabase/server";
import { failure, json, sameOrigin, VisibleError } from "@/lib/http";
import { readJson } from "@/lib/request-body";
import { describeDatabaseError } from "@/lib/admin-errors";
import { themeKeys } from "@/lib/season";
import { contentSchema, contestModes } from "@/lib/contest-modes";

const iso = z.string().min(10).max(40);
const seasonSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{1,12}$/, "Kode season: huruf besar/angka, maksimal 12 karakter."),
  theme_key: z.enum(themeKeys),
  theme_title: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160).default(""),
  description: z.string().trim().max(600).default(""),
  registration_open_at: iso,
  registration_close_at: iso,
  submission_global_close_at: iso,
  judging_at: iso,
  announcement_at: iso,
  shipping_at: iso,
  prize_preparation_start: z.string().max(10).default(""),
  prize_preparation_end: z.string().max(10).default(""),
  quota: z.union([z.literal(""), z.coerce.number().int().min(1).max(1000000)]).default(""),
  contest_mode: z.enum(contestModes).default("classic"),
  registration_fee: z.coerce.number().int().min(0).max(10_000_000).default(20000),
  claim_fee: z.coerce.number().int().min(0).max(10_000_000).default(120000),
  content: contentSchema.default({}),
});

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), id: z.uuid().nullable().default(null), data: seasonSchema }),
  z.object({ action: z.literal("activate"), id: z.uuid() }),
  z.object({ action: z.literal("delete"), id: z.uuid(), confirmation: z.literal("HAPUS SEASON") }),
]);

export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const input = schema.parse(await readJson(req));
    const { db } = await admin(["admin", "super_admin"]);
    if (input.action === "save") {
      const order = [
        ["registration_open_at", "registration_close_at", "Pendaftaran dibuka harus sebelum pendaftaran ditutup."],
        ["registration_close_at", "submission_global_close_at", "Batas karya tidak boleh sebelum pendaftaran ditutup."],
        ["submission_global_close_at", "judging_at", "Penilaian harus setelah batas karya."],
        ["judging_at", "announcement_at", "Pengumuman harus setelah penilaian."],
        ["announcement_at", "shipping_at", "Pengiriman harus setelah pengumuman."],
      ] as const;
      for (const [a, b, message] of order) {
        const left = new Date(input.data[a]).getTime();
        const right = new Date(input.data[b]).getTime();
        if (Number.isNaN(left) || Number.isNaN(right)) throw new VisibleError("Format tanggal tidak valid.");
        if (a === "registration_close_at" ? left > right : left >= right) throw new VisibleError(message);
      }
      const { data, error } = await db.rpc("admin_save_season", {
        p_id: input.id,
        p: { ...input.data, quota: input.data.quota === "" ? "" : String(input.data.quota) },
      });
      if (error) throw new VisibleError(describeDatabaseError(error));
      return json({ ok: true, id: data });
    }
    if (input.action === "activate") {
      const { error } = await db.rpc("admin_activate_season", { p_id: input.id });
      if (error) throw new VisibleError(describeDatabaseError(error));
      return json({ ok: true });
    }
    const { error } = await db.rpc("admin_delete_season", { p_id: input.id });
    if (error) throw new VisibleError(describeDatabaseError(error));
    return json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError)
      return json(
        { error: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") },
        400,
      );
    return failure(error);
  }
}
