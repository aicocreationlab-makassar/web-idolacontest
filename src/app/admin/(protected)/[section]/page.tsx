import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import { registrationQuery, seasonScope, type Filters } from "@/lib/admin-data";
import { describeDatabaseError } from "@/lib/admin-errors";
import { AdminFilters, SeasonSelect, seasonLabel } from "@/components/admin-filters";
import { AdminFilterPanel } from "@/components/admin-filter-panel";
import {
  AdminControl,
  PrivateMedia,
  VerifyControl,
  verifyState,
} from "@/components/admin-controls";
import { AdminRecord } from "@/components/admin-record";
import { AdminNotifications } from "@/components/admin-notifications";
import { ContestBadge } from "@/components/contest-badge";
import { nextAdminStep } from "@/lib/admin-steps";
import { backfillPhotoEntries } from "@/lib/photo-entries";
import { formatDateTime } from "@/lib/season";
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
import { allCategoryLabels, competitions } from "@/lib/business-rules";
import { bankLine, resolveContent, rupiah } from "@/lib/contest-modes";
import type { Season } from "@/lib/season";
import { asList, firstOf } from "@/lib/embed";
import { CopyMessage } from "@/components/copy-message";
import { WinnersAdmin, type WinnerRow } from "@/components/winners-admin";
import { backfillWinnerImages, winnerImageUrl } from "@/lib/winners";
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
  const content = resolveContent(season);
  return {
    registration_fee: content.registration_fee,
    claim_fee: content.claim_fee,
    bank: bankLine(content),
    instagram: content.instagram,
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
  ["review_pending", "Menunggu verifikasi"],
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
  pendaftaran: "Verifikasi pembayaran",
  "tambah-peserta": "Tambah peserta",
  karya: "Review karya",
  penilaian: "Penilaian juri",
  hasil: "Juara & hasil",
  "klaim-hadiah": "Klaim hadiah",
  pengiriman: "Pengiriman",
  settings: "Pengaturan",
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
  defaultAll = false,
}: {
  seasons: { id: string; name: string; is_active?: boolean }[];
  value?: string;
  activeId: string | null;
  defaultAll?: boolean;
}) {
  return (
    <AdminFilterPanel scope={seasonLabel(value, seasons, activeId, defaultAll)}>
      <SeasonSelect seasons={seasons} value={value} activeId={activeId} defaultAll={defaultAll} />
    </AdminFilterPanel>
  );
}

/** Pending claims/shipments of seasons other than the one on screen, so Season 1 winners stay visible. */
function OtherSeasonNotice({
  rows,
  seasons,
  scopedSeason,
  section,
}: {
  rows: BoardRow[];
  seasons: Season[];
  scopedSeason: string;
  section: string;
}) {
  const counts = new Map<string, { claims: number; shipping: number }>();
  for (const row of rows) {
    if (row.season_id === scopedSeason || !row.is_published || !row.award_code) continue;
    const entry = counts.get(row.season_id) ?? { claims: 0, shipping: 0 };
    if (row.claim_status !== "paid") entry.claims += 1;
    else if (!["shipped", "delivered"].includes(row.shipping_status ?? "")) entry.shipping += 1;
    counts.set(row.season_id, entry);
  }
  const items = seasons
    .map((season) => ({ season, ...(counts.get(season.id) ?? { claims: 0, shipping: 0 }) }))
    .filter((item) => item.claims || item.shipping);
  if (!items.length) return null;
  return (
    <div className="stack">
      {items.map((item) => (
        <p className="notice" key={item.season.id}>
          <b>{item.season.name}</b>: {item.claims} juara menunggu klaim/konfirmasi hadiah ·{" "}
          {item.shipping} belum dikirim.{" "}
          <Link className="underline font-bold" href={`/admin/${section}?season=${item.season.id}`}>
            Lihat {item.season.name}
          </Link>{" "}
          ·{" "}
          <Link className="underline font-bold" href={`/admin/${section}?season=all`}>
            Semua season
          </Link>
        </p>
      ))}
    </div>
  );
}

function withQuery(href: string, param: string) {
  if (!param) return href;
  return `${href}${href.includes("?") ? "&" : "?"}${param}`;
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

  if (section === "tambah-peserta") {
    const { data: activeRow } = await db
      .from("seasons")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();
    return (
      <>
        <PageHeading title={titles[section]} />
        <RegistrationForm manual content={resolveContent(activeRow as Season | null)} />
      </>
    );
  }

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
  // Every page shows the active season by default; Pengiriman shows all seasons
  // because prizes of earlier seasons are still shipped after a new one starts.
  const scopedSeason = seasonScope(
    filters.season,
    activeSeason?.id ?? null,
    section === "pengiriman",
  );

  if (section === "settings") {
    return (
      <>
        <PageHeading
          title={titles[section]}
          description="Notifikasi HP admin, lalu season, tema, dan timeline website."
        />
        <section className="stack mb-8">
          <div className="admin-section-title">
            <div>
              <span className="eyebrow">Notifikasi</span>
              <h2>Notifikasi realtime di HP</h2>
              <p className="muted text-sm">
                Aktifkan di setiap HP admin supaya pendaftaran, karya, dan konfirmasi
                hadiah baru langsung masuk sebagai notifikasi.
              </p>
            </div>
          </div>
          <AdminNotifications />
        </section>
        <section className="stack">
          <div className="admin-section-title">
            <div>
              <span className="eyebrow">Season &amp; tema</span>
              <h2>Season, tema, dan timeline</h2>
              <p className="muted text-sm">
                Buat season baru, tentukan tema dan tampilan website, atur timeline, lalu
                aktifkan. Website publik langsung berganti tema saat season diaktifkan.
              </p>
            </div>
          </div>
          <SeasonManager
            seasons={seasonRows}
            canPurge={profile.role === "super_admin"}
            canDelete={profile.role === "super_admin"}
          />
        </section>
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
    // Photogenic entries verified before entries were automatic join the queue here.
    if (profile.role !== "judge") await backfillPhotoEntries(db, scopedSeason);
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
        <JudgingBoard
          rows={(data ?? []) as QueueRow[]}
          judge={profile.role === "judge"}
          seasons={seasonRows}
        />
      </>
    );
  }

  if (section === "hasil" || section === "klaim-hadiah" || section === "pengiriman") {
    const { data, error } = await db.rpc("admin_leaderboard", { p_season: scopedSeason });
    if (error)
      return <LoadError message={describeDatabaseError(error, "Papan hasil tidak dapat dimuat.")} />;
    const rows = (data ?? []) as BoardRow[];
    const boardSeason = seasonRows.find((s) => s.id === scopedSeason) ?? activeSeason;
    const boardContent = resolveContent(boardSeason);
    // Winners of other seasons still need claims and shipments handled after a new season starts.
    let otherRows: BoardRow[] = [];
    if (scopedSeason && section !== "hasil" && seasonRows.length > 1) {
      const { data: allData } = await db.rpc("admin_leaderboard", { p_season: null });
      otherRows = (allData ?? []) as BoardRow[];
    }
    let winnerRows: WinnerRow[] = [];
    if (section === "hasil") {
      // Winners announced before the artwork-copy step existed get their copy here.
      await backfillWinnerImages(24);
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
    query.set("season", scopedSeason ?? "all");
    return (
      <>
        <PageHeading
          title={titles[section]}
          description={
            section === "hasil"
              ? boardContent.mode === "national"
                ? "Peringkat diperbarui otomatis setiap nilai juri disimpan. Mode Nasional: peringkat 1–4 tiap kategori otomatis menjadi Best of the Best, Juara Umum, Juara Harapan, dan Juara Favorit. Mengumumkan juara membuka langkah konfirmasi hadiah (gratis) di Cek Status peserta."
                : "Peringkat diperbarui otomatis setiap nilai juri disimpan. Juara Utama 1–3, Harapan 1–3, dan Favorit 1–3 ditetapkan otomatis dari peringkat; Juara Umum dan Best Social Media diatur manual. Mengumumkan juara otomatis menerbitkan invoice klaim dan memperbarui Cek Status peserta."
              : section === "klaim-hadiah"
                ? boardContent.claim_fee === 0
                  ? "Hadiah season ini gratis (tanpa penebusan). Saat juara diumumkan, peserta mengonfirmasi alamat dan rekening hadiah lewat Cek Status; konfirmasi tampil di sini dan membuka menu pengiriman."
                  : `Invoice ${rupiah(boardContent.claim_fee)} terbit otomatis saat juara diumumkan. Tandai lunas setelah transfer diterima; peserta melihat statusnya lewat kode registrasi.`
                : "Isi kurir, nomor resi, dan status. Peserta langsung melihat resi di Cek Status."
          }
        />
        <SeasonPicker
          seasons={seasonRows}
          value={filters.season}
          activeId={activeSeason?.id ?? null}
          defaultAll={section === "pengiriman"}
        />
        <div className="actions">
          <a className="btn secondary" href={`/api/admin/export?${query}&kind=${section}`}>
            Ekspor CSV
          </a>
        </div>
        {scopedSeason && otherRows.length > 0 && (
          <OtherSeasonNotice
            rows={otherRows}
            seasons={seasonRows}
            scopedSeason={scopedSeason}
            section={section}
          />
        )}
        {section === "hasil" ? (
          <>
            <ResultsBoard rows={rows} seasonId={scopedSeason} season={boardSeason} seasons={seasonRows} />
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
          <ClaimsBoard rows={rows} season={boardSeason} seasons={seasonRows} />
        ) : (
          <ShippingBoard rows={rows} season={boardSeason} seasons={seasonRows} />
        )}
      </>
    );
  }

  if (section === "karya") {
    // Photogenic participants' registration photos become their entries.
    await backfillPhotoEntries(db, scopedSeason);
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
        <AdminFilterPanel
          scope={seasonLabel(filters.season, seasonRows, activeSeason?.id ?? null)}
          active={filters.review ? 1 : 0}
        >
          <SeasonSelect seasons={seasonRows} value={filters.season} activeId={activeSeason?.id ?? null} />
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
        </AdminFilterPanel>
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
              <article className="card stack admin-karya-card" key={s.id}>
                <div className="judging-head">
                  <div className="stack">
                    <h3>{registration.participants?.public_name || "Peserta"}</h3>
                    <div className="admin-record-tags">
                      <ContestBadge
                        type={registration.competition_type}
                        label={friendly(registration.competition_type)}
                      />
                      <span className="admin-record-category">{friendly(registration.category)}</span>
                      {s.source === "registration_photo" && (
                        <span className="admin-status status-verified">Dari foto pendaftaran</span>
                      )}
                    </div>
                  </div>
                  <span className={`admin-status status-${s.status}`}>
                    {friendly(s.status)} · {friendly(s.publication_status)}
                  </span>
                </div>
                <PrivateMedia id={s.id} kind="submission" />
                <details className="admin-record-details">
                  <summary>Lihat detail</summary>
                  <div className="admin-record-body">
                    <p>
                      {registration.participants?.full_name} · {registration.registration_code}
                    </p>
                    <p className="muted text-sm">Dikirim {formatDateTime(s.submitted_at)}</p>
                    {s.review_note && <p className="text-sm">Catatan: {s.review_note}</p>}
                    <Link className="text-purple font-bold underline" href={`/admin/peserta/${s.registration_id}`}>
                      Buka detail peserta
                    </Link>
                  </div>
                </details>
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
        <SeasonPicker seasons={seasonRows} value={filters.season} activeId={activeSeason?.id ?? null} />
        <div className="grid3 admin-summary-grid">
          {dashboardMetrics.map(([key, label]) => (
            <Link
              className="card"
              key={key}
              href={withQuery(
                {
                  total_registrasi: "/admin/peserta",
                  review_pending: "/admin/pendaftaran",
                  pembayaran_paid: "/admin/peserta?payment=paid",
                  karya_pending: "/admin/karya?review=pending_review",
                  karya_dinilai: "/admin/penilaian",
                  juara_diumumkan: "/admin/hasil",
                  klaim_dibayar: "/admin/klaim-hadiah",
                  terkirim: "/admin/pengiriman",
                }[key] || "/admin/dashboard",
                filters.season ? `season=${encodeURIComponent(filters.season)}` : "",
              )}
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

  // Verifikasi Pembayaran lists registrations still waiting by default.
  const verification = section === "pendaftaran";
  const listFilters: Filters = {
    ...filters,
    season: scopedSeason ?? "all",
    access: verification ? (filters.access ?? "registered") : filters.access,
  };
  const { data, error, count } = await registrationQuery(db, listFilters).range(
    offset,
    offset + 24,
  );
  if (error) return <LoadError message={describeDatabaseError(error, "Peserta tidak dapat dimuat.")} />;
  const query = new URLSearchParams(
    Object.entries(listFilters).filter(([k, v]) => k !== "page" && !!v) as [string, string][],
  );
  return (
    <>
      <PageHeading
        title={titles[section]}
        description={
          verification
            ? "Cocokkan bukti transfer di DM Instagram dengan nama, kode, dan username peserta. Satu klik “Pembayaran valid, terima” langsung menyetujui pendaftaran dan menandai lunas. Foto peserta fotogenik otomatis menjadi karya lomba."
            : "Ringkasan setiap peserta beserta langkah berikutnya. Buka “Lihat detail” untuk status lengkap dan pesan siap salin."
        }
      />
      <AdminFilters
        filters={filters}
        seasons={seasonRows}
        activeId={activeSeason?.id ?? null}
        defaultAccess={verification ? "registered" : ""}
      />
      <div className="actions">
        <a
          className="btn secondary"
          href={`/api/admin/export?${query}&kind=peserta`}
        >
          Ekspor CSV sesuai filter
        </a>
        <Link className="btn" href="/admin/tambah-peserta">
          Tambah peserta
        </Link>
      </div>
      <p className="admin-list-count">
        <b>{count || 0}</b>{" "}
        {verification && listFilters.access === "registered"
          ? "peserta menunggu verifikasi pembayaran"
          : "peserta"}
      </p>
      <div className="admin-record-list">
        {data.map((r) => {
          const rowSeason = seasonRows.find((s) => s.id === r.season_id) ?? activeSeason;
          const context = rowContext(r as ParticipantRow, rowSeason);
          const state = verifyState(r);
          const href = `/admin/peserta/${r.id}`;
          const instagram = String(r.participants.instagram_username || "").replace(/^@/, "");
          return (
            <AdminRecord
              key={r.id}
              name={r.participants.full_name}
              href={href}
              code={r.registration_code}
              competition={r.competition_type}
              category={friendly(r.category)}
              step={nextAdminStep(context)}
              meta={
                <>
                  {instagram ? `@${instagram} · ` : ""}daftar {formatDateTime(r.created_at)}
                </>
              }
              action={
                verification || state !== "verified" ? (
                  <VerifyControl id={r.id} state={state} note={r.review_note} />
                ) : (
                  <Link className="btn secondary" href={href}>
                    Buka detail lengkap
                  </Link>
                )
              }
            >
              <dl className="admin-record-facts">
                <div>
                  <dt>Nama publik</dt>
                  <dd>{r.participants.public_name}</dd>
                </div>
                <div>
                  <dt>Domisili</dt>
                  <dd>
                    {r.participants.regency_name}, {r.participants.province_name}
                  </dd>
                </div>
                <div>
                  <dt>Sumber</dt>
                  <dd>{friendly(r.registration_source)}</dd>
                </div>
                <div>
                  <dt>Season</dt>
                  <dd>{rowSeason?.name ?? "—"}</dd>
                </div>
              </dl>
              <div className="admin-record-pills">
                <span className={`admin-status status-${r.payment_status}`}>
                  Bayar: {friendly(r.payment_status)}
                </span>
                <span className={`admin-status status-${r.registration_status}`}>
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
                    <span className="admin-status" key={x.id}>
                      {x.rank_position ? `#${x.rank_position} · ` : ""}
                      {x.award_code} · {x.final_score} ·{" "}
                      {x.is_published ? "diumumkan" : "belum diumumkan"}
                    </span>
                  ),
                )}
                {asList(r.claim_invoices).map(
                  (x: { id: string; status: string; invoice_number: string }) => (
                    <span className={`admin-status status-${x.status}`} key={x.id}>
                      {x.invoice_number} · {friendly(x.status)}
                    </span>
                  ),
                )}
                {asList(r.shipments).map(
                  (x: { id: string; shipping_status: string; tracking_number: string }) => (
                    <span className={`admin-status status-${x.shipping_status}`} key={x.id}>
                      {friendly(x.shipping_status)}
                      {x.tracking_number ? ` · ${x.tracking_number}` : ""}
                    </span>
                  ),
                )}
              </div>
              <Link className="text-purple font-bold underline" href={href}>
                Buka detail lengkap
              </Link>
              <CopyMessage compact context={context} />
            </AdminRecord>
          );
        })}
      </div>
      {!data.length && (
        <p className="admin-empty card">
          {verification && listFilters.access === "registered"
            ? "Semua pendaftar sudah diverifikasi. Tidak ada yang menunggu."
            : "Kosong — belum ada peserta yang sesuai filter."}
        </p>
      )}
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
