import { session } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/http";
export async function POST(req: Request) {
  sameOrigin(req);
  await (await session()).auth.signOut();
  return Response.redirect(new URL("/admin/login", req.url), 303);
}
