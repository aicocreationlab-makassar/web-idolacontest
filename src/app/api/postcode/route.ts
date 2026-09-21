import { json } from "@/lib/http";
export async function GET(req: Request) {
  const village = new URL(req.url).searchParams.get("village");
  if (!village || !/^\d{2,12}(?:\.\d{2,4}){0,3}$/.test(village))
    return json({ postal_code: null });
  const base = process.env.POSTAL_CODE_API_BASE_URL;
  if (!base) return json({ postal_code: null });
  try {
    const url = new URL(base);
    url.searchParams.set("village", village);
    const r = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    const d = await r.json();
    return json({
      postal_code: /^\d{5}$/.test(d.postal_code) ? d.postal_code : null,
    });
  } catch {
    return json({ postal_code: null });
  }
}
