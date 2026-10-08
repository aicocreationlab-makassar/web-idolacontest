// Gives every winner without an artwork copy its own public image under
// gallery-public/winners/. Safe to run repeatedly: node --env-file=.env scripts/sync-winner-images.mjs
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("CONFIG=INCOMPLETE");
  process.exit(1);
}
const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: winners, error } = await db
  .from("winners")
  .select("id,public_name,award_code,image_path,source_image_path,registration_id")
  .is("image_path", null)
  .order("published_at", { ascending: true });
if (error) {
  console.error("WINNERS_ERROR", error.message);
  process.exit(1);
}
console.log(`Pemenang tanpa foto: ${winners.length}`);

for (const row of winners) {
  let publicPath = null;
  let privatePath = row.source_image_path;
  if (row.registration_id) {
    const { data: submission } = await db
      .from("submissions")
      .select("private_file_path,public_file_path")
      .eq("registration_id", row.registration_id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    publicPath = submission?.public_file_path ?? null;
    privatePath = privatePath || submission?.private_file_path || null;
  }
  const path = `winners/${randomUUID()}.webp`;
  let done = false;
  if (publicPath) {
    const { error: copyError } = await db.storage.from("gallery-public").copy(publicPath, path);
    done = !copyError;
  }
  if (!done && privatePath) {
    const { data: blob, error: downloadError } = await db.storage
      .from("submission-private")
      .download(privatePath);
    if (!downloadError && blob) {
      const bytes = await sharp(Buffer.from(await blob.arrayBuffer()))
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const { error: uploadError } = await db.storage
        .from("gallery-public")
        .upload(path, bytes, { contentType: "image/webp", upsert: false });
      done = !uploadError;
    }
  }
  if (!done) {
    console.log(`SKIP ${row.public_name} (${row.award_code}): sumber karya tidak ditemukan`);
    continue;
  }
  const { error: updateError } = await db
    .from("winners")
    .update({ image_path: path, source_image_path: privatePath })
    .eq("id", row.id);
  console.log(`${updateError ? "FAIL" : "OK"} ${row.public_name} (${row.award_code}) -> ${path}`);
}
