import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { imageBytes } from "../src/lib/image-processing";

test("Image sanitization produces WebP, rotates and strips private metadata", async () => {
  const source = await sharp({
    create: { width: 400, height: 250, channels: 3, background: "#ffbde2" },
  })
    .jpeg()
    .withMetadata({
      orientation: 6,
      exif: { IFD0: { Artist: "Private parent name" } },
    })
    .toBuffer();
  const bytes = await imageBytes(
    new File([new Uint8Array(source)], "child.jpg", { type: "image/jpeg" }),
  );
  const result = await sharp(bytes).metadata();
  assert.equal(result.format, "webp");
  assert.equal(result.width, 250);
  assert.equal(result.height, 400);
  assert.equal(result.exif, undefined);
  assert.ok(bytes.length <= 2097152);
});
test("Upload rejects forged images, unsupported MIME, missing and oversized files", async () => {
  await assert.rejects(() => imageBytes(null));
  await assert.rejects(() =>
    imageBytes(new File(["<svg/>"], "fake.svg", { type: "image/svg+xml" })),
  );
  await assert.rejects(() =>
    imageBytes(new File(["not an image"], "fake.png", { type: "image/png" })),
  );
  await assert.rejects(() =>
    imageBytes(
      new File([new Uint8Array(2097153)], "large.png", { type: "image/png" }),
    ),
  );
  const png = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  await assert.rejects(() =>
    imageBytes(
      new File([new Uint8Array(png)], "wrong.jpg", { type: "image/jpeg" }),
    ),
  );
});
