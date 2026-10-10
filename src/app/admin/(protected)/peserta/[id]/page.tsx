import { notFound, redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import {
  AdminControl,
  PrivateMedia,
  WorksheetUpload,
  DeleteRegistration,
} from "@/components/admin-controls";
import { PageHeading } from "@/components/shared";
import { allCategoryLabels, competitions } from "@/lib/business-rules";
import { bankLine, resolveContent } from "@/lib/contest-modes";
import { formatParticipantAge } from "@/lib/participant";
import { CopyMessage } from "@/components/copy-message";
import { asList, firstOf } from "@/lib/embed";
import { calculateSubmissionDeadline } from "@/lib/business-rules";

const labels: Record<string, string> = {
  ...allCategoryLabels,
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
      "*,participants(*),participant_media(*),worksheets(*),submissions(*),results(*),claim_invoices(*),shipments(*)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !registration) notFound();
  const participant = registration.participants;
  const reviewStatus = registration.review_status || "pending";
  const participantMedia = registration.participant_media ?? [];
  const worksheets = registration.worksheets ?? [];
  const submissions = registration.submissions ?? [];
  const { data: season } = await db
    .from("seasons")
    .select("*")
    .eq("id", registration.season_id)
    .maybeSingle();
  const latestSubmission = [...submissions].sort((a: { created_at: string }, b: { created_at: string }) =>
    a.created_at < b.created_at ? 1 : -1,
  )[0] as { status: string; publication_status: string } | undefined;
  const result = firstOf(registration.results as { award_code: string; rank_position: number | null; is_published: boolean }[] | null);
  const claim = firstOf(registration.claim_invoices as { invoice_number: string; status: string }[] | null);
  const shipment = firstOf(registration.shipments as { courier: string; tracking_number: string | null; shipping_status: string }[] | null);
  const content = resolveContent(season);
  const messageContext = {
    registration_fee: content.registration_fee,
    claim_fee: content.claim_fee,
    bank: bankLine(content),
    instagram: content.instagram,
    public_name: participant.public_name,
    registration_code: registration.registration_code,
    competition_type: registration.competition_type,
    category: registration.category,
    season_name: season?.name,
    theme_title: season?.theme_title || "Cita Citaku",
    announcement_at: season?.announcement_at,
    shipping_at: season?.shipping_at,
    deadline: season
      ? calculateSubmissionDeadline(registration.created_at, season.submission_global_close_at).toISOString()
      : null,
    payment_status: registration.payment_status,
    review_status: reviewStatus,
    worksheet_ready: asList(worksheets).length > 0,
    submission_status: latestSubmission?.status ?? null,
    publication_status: latestSubmission?.publication_status ?? null,
    award_code: result?.award_code ?? null,
    rank_position: result?.rank_position ?? null,
    result_published: result?.is_published ?? false,
    invoice_number: claim?.invoice_number ?? null,
    claim_status: claim?.status ?? null,
    courier: shipment?.courier ?? null,
    tracking_number: shipment?.tracking_number ?? null,
    shipping_status: shipment?.shipping_status ?? null,
  };

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

      <section className="card stack mb-6">
        <div className="admin-section-title">
          <div>
            <span className="eyebrow">Kabari Mommy via DM Instagram</span>
            <h2>Pesan personal siap salin</h2>
            <p className="muted text-sm">
              Pesan menyesuaikan tahap peserta: kode registrasi, cara cek status, pembayaran,
              worksheet, karya, pengumuman juara, invoice klaim, sampai resi.
            </p>
          </div>
        </div>
        <CopyMessage context={messageContext} />
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
            <Detail
              label="Usia"
              value={formatParticipantAge(participant.age, participant.age_unit)}
            />
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
