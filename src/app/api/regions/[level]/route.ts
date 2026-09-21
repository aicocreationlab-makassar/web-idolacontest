import { regions } from "@/lib/locations";
import { json, failure } from "@/lib/http";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ level: string }> },
) {
  try {
    return json(
      await regions(
        (await params).level,
        new URL(req.url).searchParams.get("parent") || "",
      ),
    );
  } catch (e) {
    return failure(e);
  }
}
