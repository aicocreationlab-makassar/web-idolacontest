import sharp from 'sharp';

/** Decode and re-encode accepted images; metadata and user filenames never survive. */
export async function imageBytes(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0 || file.size > 2 * 1024 * 1024)
    throw new Error('File gambar wajib diisi dan maksimum 2 MB.');
  const formats: Record<string,string> = {'image/jpeg':'jpeg','image/png':'png','image/webp':'webp'};
  if (!formats[file.type] || !/\.(jpe?g|png|webp)$/i.test(file.name))
    throw new Error('File harus JPG, PNG, atau WebP.');
  try {
    const source = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(source,{limitInputPixels:25000000}).metadata();
    if (meta.format !== formats[file.type] || (meta.pages ?? 1)>1) throw new Error();
    const bytes = await sharp(source,{limitInputPixels:25000000})
      .rotate().resize(2000,2000,{fit:'inside',withoutEnlargement:true})
      .webp({quality:86}).toBuffer();
    if (bytes.length > 2097152) throw new Error();
    return bytes;
  } catch {
    throw new Error('Gambar tidak valid atau terlalu besar setelah diproses.');
  }
}
