import { notFound, redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import {
  AdminControl,
  PrivateMedia,
  WorksheetUpload,
  DeleteRegistration,
} from "@/components/admin-controls";
import { PageHeading } from "@/components/shared";
import { categories, competitions } from "@/lib/business-rules";

const labels: Record<string, string> = {
  ...categories,
  ...competitions,
  website: "Website",
  instagram_dm: "Instagram",
  admin_manual: "Dicatat admin",
  pending: "Menunggu",
  pending_review: "Menunggu pemeriksaan",
  approved: "Disetujui",
  rejected: "Ditolak",
  paid: "Sudah dibayar",
  unpaid: "Belum dibayar",
  verified: "Aktif",
  blocked: "Tidak aktif",
  draft: "Belum ditampilkan",
};
const friendly = (value: string) => labels[value] || value.replaceAll("_", " ");

function Detail({ label, value }: { label: string; value?: unknown }) {
  return (
    <div className="admin-detail-item">
      <dt>{label}</dt>
      <dd>
        {value === null || value === undefined || value === ""
          ? "—"
          : String(value)}
      </dd>
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let adminContext;
  try {
    adminContext = await admin(["admin", "super_admin"]);
  } catch {
    redirect("/admin/login");
  }
  const { db } = adminContext;
  const { id } = await params;
  const { data: registration, error } = await db
    .from("registrations")
    .select(
      "*,participants(*),participant_media(*),worksheets(*),submissions(*)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !registration) notFound();
  const participant = registration.participants;
  const reviewStatus = registration.review_status || "pending";
  const participantMedia = registration.participant_media ?? [];
  const worksheets = registration.worksheets ?? [];
  const submissions = registration.submissions ?? [];

  return (
    <>
      <PageHeading
        title={participant.full_name}
        description={`${registration.registration_code} · ${friendly(registration.competition_type)} · ${friendly(registration.category)}`}
      />

      <section className="admin-review-panel">
        <div>
          <span className={`admin-status status-${reviewStatus}`}>
            {reviewStatus === "approved"
              ? "Pendaftaran approved"
              : reviewStatus === "rejected"
                ? "Pendaftaran rejected"
                : "Menunggu review"}
          </span>
          <h2>Keputusan pendaftaran</h2>
          <p>
            Periksa seluruh data dan foto peserta. Approve mengizinkan proses
            berikutnya setelah pembayaran berstatus sudah dibayar. Reject
            menutup akses kode pendaftaran.
          </p>
          {registration.review_note && (
            <p className="notice">
              Catatan terakhir: {registration.review_note}
            </p>
          )}
        </div>
        <AdminControl
          action="registration_review"
          id={registration.id}
          initial={{ status: reviewStatus, note: registration.review_note }}
        />
      </section>

      <div className="admin-detail-layout">
        <section className="card stack">
          <div className="admin-section-title">
            <div>
              <span className="eyebrow">Data lengkap</span>
              <h2>Identitas peserta</h2>
            </div>
          </div>
          <dl className="admin-detail-grid">
            <Detail label="Nama lengkap" value={participant.full_name} />
            <Detail label="Nama publik" value={participant.public_name} />
            <Detail label="Usia" value={`${participant.age} tahun`} />
            <Detail label="Sekolah" value={participant.school_name} />
            <Detail label="Kelas" value={registration.class_label} />
            <Detail label="Cita-cita" value={registration.dream_job} />
            <Detail
              label="Jenis lomba"
              value={friendly(registration.competition_type)}
            />
            <Detail label="Kategori" value={friendly(registration.category)} />
            <Detail
              label="Sumber pendaftaran"
              value={friendly(registration.registration_source)}
            />
            <Detail
              label="Waktu daftar"
              value={`${new Date(registration.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`}
            />
          </dl>

          <h3>Orang tua dan kontak</h3>
          <dl className="admin-detail-grid">
            <Detail
              label="Nama orang tua / wali"
              value={participant.parent_name}
            />
            <Detail label="WhatsApp" value={participant.whatsapp} />
            <Detail label="Instagram" value={participant.instagram_username} />
          </dl>

          <h3>Alamat lengkap</h3>
          <dl className="admin-detail-grid">
            <Detail label="Alamat" value={participant.address_line} />
            <Detail label="Kelurahan / desa" value={participant.village_name} />
            <Detail label="Kecamatan" value={participant.district_name} />
            <Detail label="Kabupaten / kota" value={participant.regency_name} />
            <Detail label="Provinsi" value={participant.province_name} />
            <Detail label="Kode pos" value={participant.postal_code} />
          </dl>

          <h3>Persetujuan</h3>
          <p className="notice success">
            Persetujuan orang tua, publikasi, syarat, dan biaya tercatat pada{" "}
            {new Date(registration.consented_at).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}{" "}
            WIB.
          </p>

          <h3>Foto peserta</h3>
          {participantMedia.length ? (
            participantMedia.map((media: { id: string }) => (
              <PrivateMedia key={media.id} id={media.id} kind="participant" />
            ))
          ) : (
            <p className="admin-empty">Kosong — belum ada foto peserta.</p>
          )}
        </section>

        <aside className="stack">
          <section className="card stack">
            <div>
              <span
                className={`admin-status status-${registration.payment_status}`}
              >
                Pembayaran: {friendly(registration.payment_status)}
              </span>
              <span
                className={`admin-status status-${registration.registration_status}`}
              >
                Akses: {friendly(registration.registration_status)}
              </span>
            </div>
            <h2>Verifikasi pembayaran</h2>
            <p className="muted">
              Tandai sudah dibayar hanya setelah bukti pembayaran diperiksa.
            </p>
            <AdminControl
              action="payment"
              id={registration.id}
              initial={{ status: registration.payment_status }}
            />
          </section>

          <section className="card stack">
            <h2>Worksheet dan karya</h2>
            {registration.competition_type === "coloring" && (
              <WorksheetUpload id={registration.id} />
            )}
            {worksheets.length ? (
              worksheets.map((worksheet: { id: string; version: number }) => (
                <div className="admin-media-item" key={worksheet.id}>
                  <b>Worksheet versi {worksheet.version}</b>
                  <PrivateMedia id={worksheet.id} kind="worksheet" />
                </div>
              ))
            ) : (
              <p className="admin-empty">Kosong — belum ada worksheet.</p>
            )}
            {submissions.length ? (
              submissions.map(
                (submission: {
                  id: string;
                  status: string;
                  publication_status: string;
                }) => (
                  <div className="admin-media-item stack" key={submission.id}>
                    <p>
                      <b>Status karya:</b> {friendly(submission.status)} ·{" "}
                      {friendly(submission.publication_status)}
                    </p>
                    <PrivateMedia id={submission.id} kind="submission" />
                    {submission.publication_status === "approved" ? (
                      <AdminControl action="unpublish" id={submission.id} />
                    ) : (
                      <AdminControl action="review" id={submission.id} />
                    )}
                  </div>
                ),
              )
            ) : (
              <p className="admin-empty">
                Kosong — peserta belum mengunggah karya.
              </p>
            )}
          </section>
        </aside>
      </div>

      <DeleteRegistration id={registration.id} />
    </>
  );
}
