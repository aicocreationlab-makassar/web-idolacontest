import { PageHeading } from "@/components/shared";
import { RegistrationForm } from "@/components/registration-form";
import { getActiveSeason } from "@/lib/data";
import { canAcceptRegistration } from "@/lib/business-rules";
export const dynamic = "force-dynamic";
export const metadata = { title: "Daftar lomba" };
export default async function Page() {
  const season = await getActiveSeason();
  return (
    <div className="wrap section max-w-4xl">
      <PageHeading
        eyebrow="Langkah pertama menuju mimpi"
        title="Yuk, daftarkan si kecil."
        description="Siapkan data anak, foto, dan alamat pengiriman. Tidak perlu membuat akun."
      />
      {!season ? (
        <p className="notice mb-6">
          Layanan pendaftaran belum dikonfigurasi. Form dapat dipelajari, tetapi
          data belum dapat dikirim.
        </p>
      ) : !canAcceptRegistration(
          season.registration_open_at,
          season.registration_close_at,
        ) ? (
        <p className="notice">Pendaftaran sedang ditutup.</p>
      ) : null}
      {(!season ||
        canAcceptRegistration(
          season.registration_open_at,
          season.registration_close_at,
        )) && <RegistrationForm />}
    </div>
  );
}
