import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import { registrationQuery, type Filters } from "@/lib/admin-data";
import { describeDatabaseError } from "@/lib/admin-errors";
import { AdminFilters } from "@/components/admin-filters";
import { AdminControl, PrivateMedia } from "@/components/admin-controls";
import {
  JudgingBoard,
  ResultsBoard,
  ClaimsBoard,
  ShippingBoard,
  type BoardRow,
  type QueueRow,
} from "@/components/admin-boards";
import { SeasonManager } from "@/components/season-manager";
import { LoadError } from "@/components/load-error";
import { RegistrationForm } from "@/components/registration-form";
import { PageHeading } from "@/components/shared";
import { categories, competitions } from "@/lib/business-rules";
import type { Season } from "@/lib/season";
import { asList, firstOf } from "@/lib/embed";
import { CopyMessage } from "@/components/copy-message";
import { WinnersAdmin, type WinnerRow } from "@/components/winners-admin";
import { winnerImageUrl } from "@/lib/winners";
import { calculateSubmissionDeadline } from "@/lib/business-rules";
import type { MessageContext } from "@/lib/messages";

type ParticipantRow = {
  registration_code: string;
  competition_type: string;
  category: string;
  payment_status: string;
  review_status: string | null;
  created_at: string;
  participants: { public_name: string };
  submissions?: Array<{ status: string; publication_status: string; created_at: string }> | { status: string; publication_status: string; created_at: string } | null;
  worksheets?: Array<{ id: string }> | { id: string } | null;
  results?: Array<{ award_code: string; rank_position: number | null; is_published: boolean }> | { award_code: string; rank_position: number | null; is_published: boolean } | null;
  claim_invoices?: Array<{ invoice_number: string; status: string }> | { invoice_number: string; status: string } | null;
  shipments?: Array<{ courier: string; tracking_number: string | null; shipping_status: string }> | { courier: string; tracking_number: string | null; shipping_status: string } | null;
};

function rowContext(r: ParticipantRow, season: Season | null): MessageContext {
  const submissions = asList(r.submissions).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const submission = submissions.find((s) => s.status === "approved" || s.status === "pending_review") ?? submissions[0];
  const result = firstOf(r.results);
  const claim = firstOf(r.claim_invoices);
  const shipment = firstOf(r.shipments);
  return {
    public_name: r.participants.public_name,
    registration_code: r.registration_code,
    competition_type: r.competition_type,
    category: r.category,
    season_name: season?.name,
    theme_title: season?.theme_title,
    announcement_at: season?.announcement_at,
    shipping_at: season?.shipping_at,
    deadline: season ? calculateSubmissionDeadline(r.created_at, season.submission_global_close_at).toISOString() : null,
    payment_status: r.payment_status,
    review_status: r.review_status,
    worksheet_ready: asList(r.worksheets).length > 0,
    submission_status: submission?.status ?? null,
    publication_status: submission?.publication_status ?? null,
    award_code: result?.award_code ?? null,
    rank_position: result?.rank_position ?? null,
    result_published: result?.is_published ?? false,
    invoice_number: claim?.invoice_number ?? null,
    claim_status: claim?.status ?? null,
    courier: shipment?.courier ?? null,
    tracking_number: shipment?.tracking_number ?? null,
    shipping_status: shipment?.shipping_status ?? null,
  };
}

const dashboardMetrics: Array<[string, string]> = [
  ["total_registrasi", "Total peserta"],
  ["review_pending", "Perlu diperiksa"],
  ["pembayaran_paid", "Pembayaran lunas"],
  ["karya_pending", "Karya perlu diperiksa"],
  ["karya_dinilai", "Karya sudah dinilai"],
  ["juara_diumumkan", "Juara diumumkan"],
  ["klaim_dibayar", "Klaim lunas"],
  ["terkirim", "Paket terkirim"],
];
const dashboardSections: Record<string, string> = {
  per_kategori: "Peserta per kategori",
  per_provinsi: "Peserta per provinsi",
  sumber_registrasi: "Asal pendaftaran",
};
const friendlyLabels: Record<string, string> = {
  ...categories,
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
  registered: "Terdaftar",
  cancelled: "Dibatalkan",
  hidden: "Belum tampil",
  published: "Sudah tampil",
  draft: "Belum ditampilkan",
  issued: "Menunggu pembayaran",
  waiting: "Menunggu",
  prepared: "Disiapkan",
  shipped: "Dikirim",
  delivered: "Diterima",
};
const friendly = (value: string) =>
  friendlyLabels[value] || value.replaceAll("_", " ");
const titles: Record<string, string> = {
  dashboard: "Dashboard",
  peserta: "Peserta",
  pendaftaran: "Pendaftaran masuk",
  "tambah-peserta": "Tambah peserta",
  karya: "Review karya",
  penilaian: "Penilaian juri",
  hasil: "Juara & hasil",
  "klaim-hadiah": "Klaim hadiah",
  pengiriman: "Pengiriman",
  settings: "Season & tema",
  audit: "Audit log",
};
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function SeasonPicker({
  seasons,
  value,
  activeId,
}: {
  seasons: { id: string; name: string; is_active?: boolean }[];
  value?: string;
  activeId: string | null;
}) {
  return (
    <form className="card flex flex-wrap gap-4 mb-6 season-picker">
      <label className="field">
        Season
        <select name="season" defaultValue={value ?? ""}>
          <option value="">{activeId ? "Season aktif" : "Semua season"}</option>
          {seasons.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name}
              {s.is_active ? " · aktif" : ""}
            </option>
          ))}
        </select>
      </label>
      <button className="btn secondary self-end">Terapkan</button>
    </form>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Filters>;
}) {
  const { section } = await params;
  if (!titles[section]) notFound();
  let adminContext;
  try {
    adminContext = await admin();
  } catch {
    redirect("/admin/login");
  }
  const { db, profile } = adminContext;
  if (profile.role === "judge" && section !== "penilaian")
    redirect("/admin/penilaian");
  const filters = await searchParams;
  const page = Math.max(1, Math.min(10000, Number(filters.page) || 1));
  const offset = (page - 1) * 25;

  if (section === "tambah-peserta")
    return (
      <>
        <PageHeading title={titles[section]} />
        <RegistrationForm manual />
      </>
    );

  const seasons =
    profile.role === "judge"
      ? { data: [] as Season[], error: null }
      : await db.from("seasons").select("*").order("created_at", { ascending: false });
  if (seasons.error)
    return <LoadError message={describeDatabaseError(seasons.error, "Season tidak dapat dimuat.")} />;
  const seasonRows = ((seasons.data ?? []) as Season[]).map((s) => ({
    ...s,
    theme_key: s.theme_key || "sky",
    theme_title: s.theme_title || "Cita Citaku",
  }));
  const activeSeason = seasonRows.find((s) => s.is_active) ?? null;
  const scopedSeason =
    filters.season === "all" ? null : filters.season || activeSeason?.id || null;

  if (section === "settings") {
    return (
      <>
        <PageHeading
          title={titles[section]}
          description="Buat season baru, tentukan tema dan tampilan website, atur timeline, lalu aktifkan. Website publik langsung berganti tema saat season diaktifkan."
        />
        <SeasonManager
          seasons={seasonRows}
          canPurge={profile.role === "super_admin"}
          canDelete={profile.role === "super_admin"}
        />
      </>
    );
  }

  if (section === "audit") {
    const { data, error, count } = await db
      .from("admin_audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + 24);
    if (error) return <LoadError message={describeDatabaseError(error, "Audit tidak dapat dimuat.")} />;
    return (
      <>
        <PageHeading title={titles[section]} />
        <div className="card overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aktor</th>
                <th>Aksi</th>
                <th>Entitas</th>
                <th>Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id}>
                  <td>
                    {new Date(d.created_at).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                    })}{" "}
                    WIB
                  </td>
                  <td>{d.admin_user_id}</td>
                  <td>{d.action}</td>
                  <td>
                    {d.entity_type}
                    <br />
                    {d.entity_id}
                  </td>
                  <td>
                    <details>
                      <summary>Lihat data privat</summary>
                      <pre className="max-w-md whitespace-pre-wrap break-all">
                        {JSON.stringify(
                          { before: d.before_data, after: d.after_data },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.length && <p>Belum ada perubahan.</p>}
        </div>
        <Pagination page={page} count={count || 0} filters={filters} />
      </>
    );
  }

  if (section === "penilaian") {
    const { data, error } = await db.rpc("admin_judging_queue", {
      p_season: profile.role === "judge" ? null : scopedSeason,
    });
    if (error)
      return <LoadError message={describeDatabaseError(error, "Antrean penilaian tidak dapat dimuat.")} />;
    return (
      <>
        <PageHeading
          title={titles[section]}
          description="Nilai tiap kriteria 0–100. Skor akhir dihitung otomatis dengan bobot 30/25/20/15/10, lalu sistem langsung meranking peserta dibanding peserta lain pada jenis lomba dan kategori usia yang sama."
        />
        {profile.role !== "judge" && (
          <SeasonPicker seasons={seasonRows} value={filters.season} activeId={activeSeason?.id ?? null} />
        )}
        <JudgingBoard rows={(data ?? []) as QueueRow[]} judge={profile.role === "judge"} />
      </>
    );
  }

  if (section === "hasil" || section === "klaim-hadiah" || section === "pengiriman") {
    const { data, error } = await db.rpc("admin_leaderboard", { p_season: scopedSeason });
    if (error)
      return <LoadError message={describeDatabaseError(error, "Papan hasil tidak dapat dimuat.")} />;
    const rows = (data ?? []) as BoardRow[];
    const boardSeason = seasonRows.find((s) => s.id === scopedSeason) ?? activeSeason;
    let winnerRows: WinnerRow[] = [];
    if (section === "hasil") {
      let winnersQuery = db.from("winners").select("*").order("published_at", { ascending: false });
      if (scopedSeason) winnersQuery = winnersQuery.eq("season_id", scopedSeason);
      const { data: winnerData } = await winnersQuery;
      winnerRows = ((winnerData ?? []) as Array<Record<string, unknown>>).map((w) => ({
        id: String(w.id),
        award_code: String(w.award_code),
        rank_position: (w.rank_position as number | null) ?? null,
        final_score: (w.final_score as number | null) ?? null,
        competition_type: String(w.competition_type),
        category: String(w.category),
        public_name: String(w.public_name),
        registration_code: String(w.registration_code),
        registration_id: (w.registration_id as string | null) ?? null,
        regency_name: (w.regency_name as string | null) ?? null,
        image_url: winnerImageUrl(w.image_path as string | null),
        published_at: String(w.published_at),
      }));
    }
    const query = new URLSearchParams(
      Object.entries(filters).filter(([k, v]) => k !== "page" && !!v),
    );
    return (
      <>
        <PageHeading
          title={titles[section]}
          description={
            section === "hasil"
              ? "Peringkat diperbarui otomatis setiap nilai juri disimpan. Juara Utama 1–3, Harapan 1–3, dan Favorit 1–3 ditetapkan otomatis dari peringkat; Juara Umum dan Best Social Media diatur manual. Mengumumkan juara otomatis menerbitkan invoice klaim dan memperbarui Cek Status peserta."
              : section === "klaim-hadiah"
                ? "Invoice Rp120.000 terbit otomatis saat juara diumumkan. Tandai lunas setelah transfer diterima; peserta melihat statusnya lewat kode registrasi."
                : "Isi kurir, nomor resi, dan status. Peserta langsung melihat resi di Cek Status."
          }
        />
        <div className="actions">
          <SeasonPicker seasons={seasonRows} value={filters.season} activeId={activeSeason?.id ?? null} />
          <a className="btn secondary" href={`/api/admin/export?${query}&kind=${section}`}>
            Ekspor CSV
          </a>
        </div>
        {section === "hasil" ? (
          <>
            <ResultsBoard rows={rows} seasonId={scopedSeason} season={boardSeason} />
            <section className="stack mt-6">
              <div className="admin-section-title">
                <div>
                  <span className="eyebrow">Data pemenang permanen</span>
                  <h2>Karya juara yang tampil di website</h2>
                  <p className="muted text-sm">
                    Dibuat otomatis saat juara diumumkan, lengkap dengan salinan karya.
                    Tetap ada walau data pendaftaran dihapus; hapus di sini untuk
                    menghilangkannya dari website dan database.
                  </p>
                </div>
              </div>
              <WinnersAdmin winners={winnerRows} />
            </section>
          </>
        ) : section === "klaim-hadiah" ? (
          <ClaimsBoard rows={rows} season={boardSeason} />
        ) : (
          <ShippingBoard rows={rows} season={boardSeason} />
        )}
      </>
    );
  }

  if (section === "karya") {
    let query = db
      .from("submissions")
      .select("*,registrations!inner(id,registration_code,competition_type,category,season_id,participants(public_name,full_name))", {
        count: "exact",
      })
      .order("created_at", { ascending: false });
    if (scopedSeason) query = query.eq("registrations.season_id", scopedSeason);
    if (filters.review) query = query.eq("status", filters.review);
    const { data, error, count } = await query.range(offset, offset + 24);
    if (error) return <LoadError message={describeDatabaseError(error, "Karya tidak dapat dimuat.")} />;
    return (
      <>
        <PageHeading
          title={titles[section]}
          description="Setujui karya terlebih dahulu, lalu publikasikan ke galeri secara terpisah. Karya yang disetujui otomatis masuk antrean penilaian juri."
        />
        <form className="card flex flex-wrap gap-4 mb-6 season-picker">
          <label className="field">
            Season
            <select name="season" defaultValue={filters.season ?? ""}>
              <option value="">Season aktif</option>
              <option value="all">Semua season</option>
              {seasonRows.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Status karya
            <select name="review" defaultValue={filters.review ?? ""}>
              <option value="">Semua</option>
              <option value="pending_review">Menunggu pemeriksaan</option>
              <option value="approved">Disetujui</option>
              <option value="revision_required">Perlu revisi</option>
              <option value="rejected">Ditolak</option>
            </select>
          </label>
          <button className="btn secondary self-end">Terapkan</button>
        </form>
        <div className="grid2">
          {data.map((s) => {
            const registration = s.registrations as {
              id: string;
              registration_code: string;
              competition_type: string;
              category: string;
              participants: { public_name: string; full_name: string } | null;
            };
            return (
              <article className="card stack" key={s.id}>
                <div className="judging-head">
                  <div>
                    <h3>{registration.participants?.public_name || "Peserta"}</h3>
                    <p className="muted text-sm">
                      {friendly(registration.competition_type)} · {friendly(registration.category)} ·{" "}
                      {registration.registration_code}
                    </p>
                  </div>
                  <span className={`admin-status status-${s.status}`}>
                    {friendly(s.status)} · {friendly(s.publication_status)}
                  </span>
                </div>
                <PrivateMedia id={s.id} kind="submission" />
                <Link className="text-purple underline" href={`/admin/peserta/${s.registration_id}`}>
                  Detail peserta
                </Link>
                {s.publication_status === "approved" ? (
                  <AdminControl action="unpublish" id={s.id} />
                ) : (
                  <>
                    <AdminControl
                      action="review"
                      id={s.id}
                      initial={{ status: s.status === "pending_review" ? "approved" : s.status, note: s.review_note }}
                    />
                    {s.status === "approved" && <AdminControl action="publish" id={s.id} />}
                  </>
                )}
              </article>
            );
          })}
        </div>
        {!data.length && <p className="notice">Belum ada karya untuk ditampilkan.</p>}
        <Pagination page={page} count={count || 0} filters={filters} />
      </>
    );
  }

  if (section === "dashboard") {
    const { data, error } = await db.rpc("admin_dashboard", {
      p_season: scopedSeason,
    });
    if (error) return <LoadError message={describeDatabaseError(error, "Dashboard tidak dapat dimuat.")} />;
    const totals = (data ?? {}) as Record<string, unknown>;
    return (
      <>
        <PageHeading
          title={`Selamat datang, ${profile.display_name || "pengelola"}.`}
          description="Pantau perjalanan peserta dari pendaftaran sampai hadiah tiba."
        />
        <form className="card flex flex-wrap gap-4 mb-6 season-picker">
          <label className="field">
            Season
            <select name="season" defaultValue={filters.season ?? ""}>
              <option value="">Season aktif</option>
              <option value="all">Semua season</option>
              {seasonRows.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn secondary self-end">Terapkan</button>
        </form>
        <div className="grid3 admin-summary-grid">
          {dashboardMetrics.map(([key, label]) => (
            <Link
              className="card"
              key={key}
              href={
                {
                  total_registrasi: "/admin/peserta",
                  review_pending: "/admin/pendaftaran?review=pending",
                  pembayaran_paid: "/admin/peserta?payment=paid",
                  karya_pending: "/admin/karya?review=pending_review",
                  karya_dinilai: "/admin/penilaian",
                  juara_diumumkan: "/admin/hasil",
                  klaim_dibayar: "/admin/klaim-hadiah",
                  terkirim: "/admin/pengiriman",
                }[key] || "/admin/dashboard"
              }
            >
              <span className="muted">{label}</span>
              <h2 className="mt-3 text-purple">{String(totals[key] ?? 0)}</h2>
            </Link>
          ))}
        </div>
        <div className="grid2 mt-6">
          {Object.entries(totals)
            .filter(
              ([key, value]) =>
                dashboardSections[key] && typeof value === "object",
            )
            .map(([k, v]) => (
              <div className="card" key={k}>
                <h3 className="mb-4">{dashboardSections[k]}</h3>
                {Object.entries((v ?? {}) as Record<string, number>).map(
                  ([label, n]) => (
                    <p className="flex justify-between" key={label}>
                      <span>{friendly(label)}</span>
                      <b>{n}</b>
                    </p>
                  ),
                )}
              </div>
            ))}
        </div>
      </>
    );
  }

  const { data, error, count } = await registrationQuery(db, filters).range(
    offset,
    offset + 24,
  );
  if (error) return <LoadError message={describeDatabaseError(error, "Peserta tidak dapat dimuat.")} />;
  const query = new URLSearchParams(
    Object.entries(filters).filter(([k, v]) => k !== "page" && !!v),
  );
  return (
    <>
      <PageHeading
        title={titles[section]}
        description={
          section === "pendaftaran"
            ? "Periksa identitas, foto, kategori, dan data lengkap peserta sebelum memilih approve atau reject."
            : undefined
        }
      />
      <AdminFilters filters={filters} seasons={seasonRows} />
      <div className="actions">
        <a
          className="btn secondary"
          href={`/api/admin/export?${query}&kind=${section}`}
        >
          Ekspor CSV sesuai filter
        </a>
        <Link className="btn" href="/admin/tambah-peserta">
          Tambah peserta
        </Link>
      </div>
      <div className="card overflow-x-auto admin-responsive-table">
        <table>
          <thead>
            <tr>
              <th>Peserta</th>
              <th>Lomba / kategori</th>
              <th>Status</th>
              <th>Operasi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td data-label="Peserta">
                  <Link
                    className="text-purple font-bold underline"
                    href={`/admin/peserta/${r.id}`}
                  >
                    {r.participants.full_name}
                  </Link>
                  <p className="text-xs break-all">{r.registration_code}</p>
                  <p>{r.participants.regency_name}</p>
                </td>
                <td data-label="Lomba / kategori">
                  {friendly(r.competition_type)}
                  <br />
                  {friendly(r.category)}
                  <br />
                  {friendly(r.registration_source)}
                </td>
                <td data-label="Status">
                  <span
                    className={`admin-status status-${r.review_status || "pending"}`}
                  >
                    {r.review_status === "approved"
                      ? "Disetujui"
                      : r.review_status === "rejected"
                        ? "Ditolak"
                        : "Menunggu pemeriksaan"}
                  </span>
                  <span className={`admin-status status-${r.payment_status}`}>
                    Bayar: {friendly(r.payment_status)}
                  </span>
                  <span
                    className={`admin-status status-${r.registration_status}`}
                  >
                    Akses: {friendly(r.registration_status)}
                  </span>
                  {asList(r.results).map(
                    (x: {
                      id: string;
                      award_code: string;
                      is_published: boolean;
                      final_score: number;
                      rank_position: number | null;
                    }) => (
                      <p key={x.id}>
                        {x.rank_position ? `#${x.rank_position} · ` : ""}
                        {x.award_code} · {x.final_score} ·{" "}
                        {x.is_published ? "Sudah diumumkan" : "Belum diumumkan"}
                      </p>
                    ),
                  )}
                  {asList(r.claim_invoices).map(
                    (x: {
                      id: string;
                      status: string;
                      invoice_number: string;
                    }) => (
                      <p key={x.id}>
                        {x.invoice_number} · {friendly(x.status)}
                      </p>
                    ),
                  )}
                  {asList(r.shipments).map(
                    (x: {
                      id: string;
                      shipping_status: string;
                      tracking_number: string;
                    }) => (
                      <p key={x.id}>
                        {friendly(x.shipping_status)} · {x.tracking_number}
                      </p>
                    ),
                  )}
                </td>
                <td data-label="Operasi" className="min-w-64">
                  {section === "pendaftaran" && (
                    <div className="stack">
                      <Link
                        className="btn secondary"
                        href={`/admin/peserta/${r.id}`}
                      >
                        Periksa detail peserta
                      </Link>
                      <AdminControl
                        action="registration_review"
                        id={r.id}
                        initial={{
                          status: r.review_status || "pending",
                          note: r.review_note,
                        }}
                      />
                      <CopyMessage compact context={rowContext(r as ParticipantRow, seasonRows.find((s) => s.id === r.season_id) ?? activeSeason)} />
                    </div>
                  )}
                  {section === "peserta" && (
                    <div className="stack">
                      <Link
                        className="text-purple font-bold underline"
                        href={`/admin/peserta/${r.id}`}
                      >
                        Buka detail lengkap
                      </Link>
                      <AdminControl
                        action="payment"
                        id={r.id}
                        initial={{ status: r.payment_status }}
                      />
                      <CopyMessage compact context={rowContext(r as ParticipantRow, seasonRows.find((s) => s.id === r.season_id) ?? activeSeason)} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.length && (
          <p className="admin-empty">
            Kosong — belum ada data{" "}
            {section === "pendaftaran" ? "pendaftaran" : "peserta"} yang sesuai.
          </p>
        )}
      </div>
      <Pagination page={page} count={count || 0} filters={filters} />
    </>
  );
}
function Pagination({
  page,
  count,
  filters,
}: {
  page: number;
  count: number;
  filters: Filters;
}) {
  const q = new URLSearchParams(
    Object.entries(filters).filter(([k, v]) => k !== "page" && !!v),
  );
  return (
    <div className="actions">
      {page > 1 && (
        <Link className="btn secondary" href={`?${q}&page=${page - 1}`}>
          Sebelumnya
        </Link>
      )}
      <span>
        {count} data · Halaman {page}
      </span>
      {page * 25 < count && (
        <Link className="btn secondary" href={`?${q}&page=${page + 1}`}>
          Berikutnya
        </Link>
      )}
    </div>
  );
}
