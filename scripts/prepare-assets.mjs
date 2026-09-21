import sharp from "sharp";
for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
])
  await sharp("logo idola contest.png")
    .resize(size, size)
    .png()
    .toFile(`public/${name}`);
await sharp("logo idola contest.png")
  .resize(380, 380)
  .extend({ top: 66, bottom: 66, left: 66, right: 66, background: "#fffcf8" })
  .png()
  .toFile("public/icon-maskable.png");
await sharp("logo idola contest.png")
  .resize(1000, 1000)
  .webp({ quality: 90 })
  .toFile("public/logo.webp");
