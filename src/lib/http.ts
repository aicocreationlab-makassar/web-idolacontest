import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { service } from "./supabase/server";
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "Permintaan gagal.";
  const safe =
    /^(Layanan|Silakan|Akses|Batas|File|Gambar|Kode|Pendaftaran|Karya|Pembayaran|Data|Wilayah|Permintaan)/.test(
      message,
    );
  return json(
    {
      error: safe
        ? message
        : "Permintaan tidak dapat diproses. Periksa data dan coba lagi.",
    },
    message.startsWith("Layanan") ? 503 : 400,
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    origin &&
    origin !== new URL(request.url).origin &&
    origin !== process.env.NEXT_PUBLIC_SITE_URL
  )
    throw new Error("Akses lintas situs ditolak.");
}
export async function rateLimit(request: Request, scope: string, limit = 15) {
  sameOrigin(request);
  const ip =
    (process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]
      : null) ||
    (process.env.TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]
      : null) ||
    "shared";
  const key = createHash("sha256").update(`${scope}:${ip}`).digest("hex");
  const { data, error } = await service().rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
  });
  if (error) throw new Error("Layanan pembatasan permintaan tidak tersedia.");
  if (!data)
    throw new Error("Batas permintaan tercapai. Coba lagi dalam 10 menit.");
}
