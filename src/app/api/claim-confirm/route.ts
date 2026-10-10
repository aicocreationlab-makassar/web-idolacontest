import { z } from "zod";
import { readJson } from "@/lib/request-body";
import { codeSchema } from "@/lib/validation";
import { service } from "@/lib/supabase/server";
import { failure, json, rateLimit } from "@/lib/http";
import { sendAdminPush } from "@/lib/push-notifications";

const schema = z.object({
  code: codeSchema,
  bank_name: z.string().trim().min(2, "Nama bank wajib diisi").max(60),
  bank_account: z
    .string()
    .trim()
    .regex(/^[0-9 -]{4,40}$/, "Nomor rekening hanya angka"),
  bank_holder: z.string().trim().min(2, "Nama pemilik rekening wajib diisi").max(120),
  address_ok: z.literal(true),
  note: z.string().trim().max(300).default(""),
});

/**
 * Winners of a free claim (national mode) confirm their shipping address and the
 * account for the cash prize. Only the registration code is needed, like the
 * other participant actions.
 */
export async function POST(req: Request) {
  try {
    await rateLimit(req, "claim", 6);
    const parsed = schema.safeParse(await readJson(req));
    if (!parsed.success)
      return json(
        {
          error: parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; "),
        },
        400,
      );
    const { code, ...data } = parsed.data;
    const { error } = await service().rpc("confirm_free_claim", {
      p_code: code,
      p_data: data,
    });
    if (error)
      throw new Error(
        "Konfirmasi belum dapat disimpan. Pastikan juara sudah diumumkan dan hadiah berstatus gratis.",
      );
    await sendAdminPush({
      title: "Konfirmasi hadiah masuk",
      body: `Juara ${code} sudah mengonfirmasi alamat dan rekening hadiah.`,
      url: "/admin/klaim-hadiah",
      tag: `claim-${code}`,
    });
    return json(
      { message: "Konfirmasi tersimpan. Admin akan menyiapkan hadiah si kecil." },
      201,
    );
  } catch (e) {
    return failure(e);
  }
}
