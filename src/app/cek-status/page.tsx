import { PageHeading } from "@/components/shared";
import { Status } from "@/components/status";
export const metadata = {
  title: "Cek status",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <div className="wrap section max-w-3xl">
      <PageHeading
        title="Sudah sampai mana, ya?"
        description="Masukkan kode registrasi untuk melihat pembayaran, worksheet, karya, klaim, dan pengiriman. Jaga kode ini tetap pribadi."
      />
      <Status />
    </div>
  );
}
