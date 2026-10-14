import { notFound, redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import {
  AdminControl,
  PrivateMedia,
  VerifyControl,
  WorksheetUpload,
  DeleteRegistration,
} from "@/components/admin-controls";
import { PageHeading } from "@/components/shared";
import { ContestBadge } from "@/components/contest-badge";
import { allCategoryLabels, competitions } from "@/lib/business-rules";
import { bankLine, resolveContent, rupiah } from "@/lib/contest-modes";
import { formatParticipantAge } from "@/lib/participant";
import { CopyMessage } from "@/components/copy-message";
import { asList, firstOf } from "@/lib/embed";
import { calculateSubmissionDeadline } from "@/lib/business-rules";
import { nextAdminStep, verifyState } from "@/lib/admin-steps";

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
  revision_required: "Perlu revisi",
  paid: "Sudah dibayar",
  unpaid: "Belum dibayar",
  refunded: "Dikembalikan",
  verified: "Aktif",
  registered: "Menunggu verifikasi",
  cancelled: "Dibatalkan",
  blocked: "Tidak aktif",
  draft: "Belum ditampilkan",
  hidden: "Belum tampil",
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
  const photogenic = registration.competition_type === "photogenic";
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
  const instagram = String(participant.instagram_username || "").replace(/^@/, "");
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
  const step = nextAdminStep(messageContext);

  return (
    <>
      <PageHeading
        title={participant.full_name}
        description={`${registration.registration_code} · ${friendly(registration.category)} · ${season?.name ?? ""}`}
      />
      <div className="admin-detail-badges">
        <ContestBadge
          large
          type={registration.competition_type}
          label={`Lomba ${friendly(registration.competition_type)}`}
        />
        <span className={`admin-next-step tone-${step.tone}`}>{step.label}</span>
      </div>

      <section className="admin-review-panel admin-verify-panel">
        <div>
          <div className="admin-record-pills">
            <span className={`admin-status status-${registration.payment_status}`}>
              Pembayaran: {friendly(registration.payment_status)}
            </span>
            <span className={`admin-status status-${registration.registration_status}`}>
              Akses: {friendly(registration.registration_status)}
            </span>
          </div>
          <h2>Verifikasi pembayaran</h2>
          <p>
            Cocokkan bukti transfer {rupiah(content.registration_fee)} di DM Instagram
            {instagram ? ` @${instagram}` : ""} dengan kode{" "}
            <b>{registration.registration_code}</b>. “Pembayaran valid, terima” langsung
            menyetujui pendaftaran dan menandai lunas
            {photogenic
              ? "; foto pendaftaran otomatis menjadi karya lomba fotogenik."
              : "; setelah itu siapkan worksheet mewarnai."}
          </p>
          {registration.review_note && (
            <p className="notice">Catatan terakhir: {registration.review_note}</p>
          )}
        </div>
        <VerifyControl
          id={registration.id}
          state={verifyState(registration)}
          note={registration.review_note}
        />
      </section>

      <div className="admin-detail-layout">
        <section className="card stack">
          <div className="admin-section-title">
            <div>
              <span className="eyebrow">Ringkasan</span>
              <h2>Data peserta</h2>
            </div>
          </div>
          <dl className="admin-detail-grid">
            <Detail label="Nama publik" value={participant.public_name} />
            <Detail
              label="Usia"
              value={formatParticipantAge(participant.age, participant.age_unit)}
            />
            <Detail label="Kategori" value={friendly(registration.category)} />
            <Detail label="WhatsApp" value={participant.whatsapp} />
            <Detail label="Instagram" value={instagram ? `@${instagram}` : ""} />
            <Detail
              label="Kota"
              value={[participant.regency_name, participant.province_name].filter(Boolean).join(", ")}
            />
          </dl>

          <h3>{photogenic ? "Foto peserta (karya lomba fotogenik)" : "Foto peserta (untuk posting finalis)"}</h3>
          {participantMedia.length ? (
            participantMedia.map((media: { id: string }) => (
              <PrivateMedia key={media.id} id={media.id} kind="participant" />
            ))
          ) : (
            <p className="admin-empty">Kosong — belum ada foto peserta.</p>
          )}

          <details className="admin-record-details">
            <summary>Data lengkap anak</summary>
            <dl className="admin-detail-grid">
              <Detail label="Nama lengkap" value={participant.full_name} />
              <Detail label="Sekolah" value={participant.school_name} />
              <Detail label="Kelas" value={registration.class_label} />
              <Detail label="Cita-cita" value={registration.dream_job} />
              <Detail label="Jenis lomba" value={friendly(registration.competition_type)} />
              <Detail label="Sumber pendaftaran" value={friendly(registration.registration_source)} />
              <Detail
                label="Waktu daftar"
                value={`${new Date(registration.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`}
              />
            </dl>
          </details>
          <details className="admin-record-details">
            <summary>Orang tua &amp; alamat pengiriman</summary>
            <dl className="admin-detail-grid">
              <Detail label="Nama orang tua / wali" value={participant.parent_name} />
              <Detail label="WhatsApp" value={participant.whatsapp} />
              <Detail label="Instagram" value={participant.instagram_username} />
              <Detail label="Alamat" value={participant.address_line} />
              <Detail label="Kelurahan / desa" value={participant.village_name} />
              <Detail label="Kecamatan" value={participant.district_name} />
              <Detail label="Kabupaten / kota" value={participant.regency_name} />
              <Detail label="Provinsi" value={participant.province_name} />
              <Detail label="Kode pos" value={participant.postal_code} />
            </dl>
          </details>
          <details className="admin-record-details">
            <summary>Persetujuan orang tua</summary>
            <p className="notice success">
              Persetujuan orang tua, publikasi, syarat, dan biaya tercatat pada{" "}
              {new Date(registration.consented_at).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
              })}{" "}
              WIB.
            </p>
          </details>
        </section>

        <aside className="stack">
          <section className="card stack">
            <h2>{photogenic ? "Karya lomba" : "Worksheet dan karya"}</h2>
            {photogenic && (
              <p className="muted text-sm">
                Fotogenik tidak upload karya: foto pendaftaran otomatis menjadi karya
                setelah pembayaran diverifikasi.
              </p>
            )}
            {registration.competition_type === "coloring" && (
              <WorksheetUpload id={registration.id} />
            )}
            {!photogenic &&
              (worksheets.length ? (
                worksheets.map((worksheet: { id: string; version: number }) => (
                  <div className="admin-media-item" key={worksheet.id}>
                    <b>Worksheet versi {worksheet.version}</b>
                    <PrivateMedia id={worksheet.id} kind="worksheet" />
                  </div>
                ))
              ) : (
                <p className="admin-empty">Kosong — belum ada worksheet.</p>
              ))}
            {submissions.length ? (
              submissions.map(
                (submission: {
                  id: string;
                  status: string;
                  publication_status: string;
                  source?: string;
                }) => (
                  <div className="admin-media-item stack" key={submission.id}>
                    <p>
                      <b>Status karya:</b> {friendly(submission.status)} ·{" "}
                      {friendly(submission.publication_status)}
                    </p>
                    {submission.source === "registration_photo" && (
                      <span className="admin-status status-verified">Dari foto pendaftaran</span>
                    )}
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
                {photogenic
                  ? "Belum ada karya. Foto pendaftaran dijadikan karya otomatis setelah pembayaran diverifikasi."
                  : "Kosong — peserta belum mengunggah karya."}
              </p>
            )}
          </section>

          <section className="card stack">
            <div className="admin-section-title">
              <div>
                <span className="eyebrow">Kabari Mommy via DM Instagram</span>
                <h2>Pesan siap salin</h2>
              </div>
            </div>
            <CopyMessage compact context={messageContext} />
          </section>

          <section className="card stack">
            <details className="admin-record-details">
              <summary>Opsi pembayaran lain (refund, dll.)</summary>
              <p className="muted text-sm">
                Untuk kasus khusus seperti pengembalian dana. Verifikasi biasa cukup lewat
                tombol di atas.
              </p>
              <AdminControl
                action="payment"
                id={registration.id}
                initial={{ status: registration.payment_status }}
              />
            </details>
          </section>
        </aside>
      </div>

      <DeleteRegistration id={registration.id} />
    </>
  );
}
