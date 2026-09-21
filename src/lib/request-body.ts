import "server-only";
async function boundedBody(request: Request, max: number) {
  if (Number(request.headers.get("content-length")) > max)
    throw new Error("Permintaan terlalu besar.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Data permintaan kosong.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new Error("Permintaan terlalu besar.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, size);
}
export async function readForm(request: Request) {
  const body = await boundedBody(request, 3 * 1024 * 1024);
  return new Response(body, {
    headers: { "Content-Type": request.headers.get("content-type") || "" },
  }).formData();
}
export async function readJson(request: Request) {
  const body = await boundedBody(request, 16384);
  return JSON.parse(body.toString("utf8")) as unknown;
}
