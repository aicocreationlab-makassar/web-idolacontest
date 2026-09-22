import "server-only";
import { service } from "./supabase/server";
export { imageBytes } from "./image-processing";
export async function upload(bucket: string, bytes: Buffer) {
  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await service()
    .storage.from(bucket)
    .upload(path, bytes, { contentType: "image/webp", upsert: false });
  if (error) throw new Error("File gagal disimpan. Coba lagi.");
  return path;
}
export async function remove(bucket: string, path: string) {
  await service().storage.from(bucket).remove([path]);
}
export async function signed(
  bucket: string,
  path: string,
  expiresIn = 86400,
  download = false,
) {
  const { data, error } = await service()
    .storage.from(bucket)
    .createSignedUrl(
      path,
      expiresIn,
      download ? { download: true } : undefined,
    );
  if (error) throw new Error("File belum dapat diakses.");
  return data.signedUrl;
}
