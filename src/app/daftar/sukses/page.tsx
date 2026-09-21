import { Success } from "@/components/success";
import { PageHeading } from "@/components/shared";
export const metadata = {
  title: "Pendaftaran tersimpan",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <div className="wrap section max-w-3xl">
      <PageHeading title="Hore, satu langkah lebih dekat!" />
      <Success />
    </div>
  );
}
