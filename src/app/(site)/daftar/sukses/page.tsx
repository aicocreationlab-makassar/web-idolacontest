import { Success } from "@/components/success";
import { PageHeading } from "@/components/shared";
import { getActiveSeason } from "@/lib/data";
import { resolveContent } from "@/lib/contest-modes";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pendaftaran tersimpan",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const season = await getActiveSeason();
  return (
    <div className="wrap section max-w-3xl">
      <PageHeading title="Hore, satu langkah lebih dekat!" />
      <Success content={resolveContent(season)} />
    </div>
  );
}
