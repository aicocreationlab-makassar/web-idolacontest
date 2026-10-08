import Link from "next/link";
import { Trophy, Medal, Receipt, Truck, Star, Users } from "lucide-react";
import { categories, competitions } from "@/lib/business-rules";
import { formatDate, formatDateTime } from "@/lib/season";
import { AdminControl, PrivateMedia } from "./admin-controls";

export type QueueRow = {
  submission_id: string;
  registration_id: string;
  season_id: string;
  competition_type: keyof typeof competitions;
  category: keyof typeof categories;
  public_name: string;
  submitted_at: string;
  my_scores: number[] | null;
  my_total: number | null;
  my_notes: string | null;
  judge_count: number;
  avg_score: number | null;
  rank_position: number | null;
  award_code: string | null;
  is_published: boolean;
};

export type BoardRow = {
  registration_id: string;
  registration_code: string;
  season_id: string;
  competition_type: keyof typeof competitions;
  category: keyof typeof categories;
  public_name: string;
  full_name: string;
  regency_name: string;
  province_name: string;
  whatsapp: string;
  score: number | null;
  judge_count: number;
  rank_position: number | null;
  award_code: string | null;
  award_source: string | null;
  is_published: boolean;
  published_at: string | null;
  final_score: number | null;
  claim_status: string | null;
  invoice_number: string | null;
  claim_paid_at: string | null;
  shipping_status: string | null;
  courier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
};

const claimLabel: Record<string, string> = {
  issued: "Menunggu pembayaran",
  paid: "Sudah dibayar",
  cancelled: "Dibatalkan",
  draft: "Draf",
};
const shippingLabel: Record<string, string> = {
  waiting: "Menunggu",
  prepared: "Sedang disiapkan",
  shipped: "Sudah dikirim",
  delivered: "Sudah diterima",
};

export function groupBy<T extends { competition_type: string; category: string }>(rows: T[]) {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = `${row.competition_type}|${row.category}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.entries()].map(([key, items]) => {
    const [competition, category] = key.split("|") as [
      keyof typeof competitions,
      keyof typeof categories,
    ];
    return { key, competition, category, items };
  });
}

/** Judging queue: every approved work, one scoring card each, grouped by competition + category. */
export function JudgingBoard({ rows, judge }: { rows: QueueRow[]; judge: boolean }) {
  if (!rows.length)
    return (
      <p className="notice">
        Belum ada karya yang siap dinilai. Karya muncul di sini setelah admin
        menyetujuinya di menu Review Karya dan pembayaran peserta lunas.
      </p>
    );
  const groups = groupBy(rows);
  const mine = rows.filter((row) => row.my_total !== null).length;
  return (
    <div className="stack">
      <div className="admin-summary-grid grid3">
        <div className="card">
          <span className="muted">Karya siap dinilai</span>
          <h2 className="mt-3 text-purple">{rows.length}</h2>
        </div>
        <div className="card">
          <span className="muted">{judge ? "Sudah Anda nilai" : "Sudah Anda nilai"}</span>
          <h2 className="mt-3 text-purple">{mine}</h2>
        </div>
        <div className="card">
          <span className="muted">Belum dinilai</span>
          <h2 className="mt-3 text-purple">{rows.length - mine}</h2>
        </div>
      </div>
      {groups.map((group) => (
        <section className="stack" key={group.key}>
          <div className="admin-group-head">
            <Star aria-hidden="true" />
            <div>
              <span className="eyebrow">{competitions[group.competition]}</span>
              <h2>Kategori {categories[group.category]}</h2>
            </div>
            <span className="admin-status">{group.items.length} karya</span>
          </div>
          <div className="grid2">
            {group.items.map((row) => (
              <article
                className={`card stack judging-card${row.my_total !== null ? " scored" : ""}`}
                key={row.submission_id}
              >
                <div className="judging-head">
                  <div>
                    <h3>{row.public_name}</h3>
                    <p className="muted text-sm">
                      Dikirim {formatDateTime(row.submitted_at)} · {row.judge_count} juri menilai
                      {row.avg_score !== null ? ` · rata-rata ${Number(row.avg_score)}` : ""}
                    </p>
                  </div>
                  {row.rank_position && (
                    <span className={`admin-status rank-badge${row.is_published ? " status-approved" : ""}`}>
                      Peringkat #{row.rank_position}
                      {row.award_code ? ` · ${row.award_code}` : ""}
                    </span>
                  )}
                </div>
                <PrivateMedia id={row.submission_id} kind="submission" />
                {row.is_published ? (
                  <p className="notice success">
                    Hasil kategori ini sudah diumumkan. Nilai dikunci.
                  </p>
                ) : (
                  <AdminControl
                    action="score"
                    id={row.submission_id}
                    competition={row.competition_type}
                    initial={{
                      scores: row.my_scores ? JSON.stringify(row.my_scores) : "",
                      notes: row.my_notes ?? "",
                    }}
                  />
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Results: live leaderboard per group with automatic awards, overrides and publishing. */
export function ResultsBoard({ rows, seasonId }: { rows: BoardRow[]; seasonId: string | null }) {
  if (!rows.length)
    return (
      <p className="notice">
        Belum ada nilai. Begitu juri menyimpan nilai, peringkat dan juara
        tiap kategori muncul otomatis di sini.
      </p>
    );
  const groups = groupBy(rows);
  return (
    <div className="stack">
      {groups.map((group) => {
        const published = group.items.filter((row) => row.is_published).length;
        const withAward = group.items.filter((row) => row.award_code).length;
        return (
          <section className="card stack leaderboard" key={group.key}>
            <div className="admin-group-head">
              <Trophy aria-hidden="true" />
              <div>
                <span className="eyebrow">{competitions[group.competition]}</span>
                <h2>Kategori {categories[group.category]}</h2>
                <p className="muted text-sm">
                  {group.items.length} peserta dinilai · {withAward} penghargaan ·{" "}
                  {published ? `${published} sudah diumumkan` : "belum diumumkan"}
                </p>
              </div>
              {seasonId && withAward > 0 && (
                <div className="leaderboard-publish">
                  <AdminControl
                    action="publish_group"
                    id={seasonId}
                    published={published === withAward}
                    compact
                    initial={{ competition: group.competition, category: group.category }}
                  />
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Peserta</th>
                    <th>Skor</th>
                    <th>Juri</th>
                    <th>Penghargaan</th>
                    <th>Status</th>
                    <th>Operasi</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((row) => (
                    <tr key={row.registration_id} className={row.rank_position && row.rank_position <= 3 ? "top" : ""}>
                      <td data-label="#">
                        <b>{row.rank_position ? `#${row.rank_position}` : "—"}</b>
                      </td>
                      <td data-label="Peserta">
                        <Link className="text-purple font-bold underline" href={`/admin/peserta/${row.registration_id}`}>
                          {row.public_name}
                        </Link>
                        <p className="text-xs muted">
                          {row.full_name} · {row.regency_name}
                        </p>
                        <p className="text-xs break-all">{row.registration_code}</p>
                      </td>
                      <td data-label="Skor">
                        <b>{row.score !== null ? Number(row.score) : "—"}</b>
                      </td>
                      <td data-label="Juri">{row.judge_count}</td>
                      <td data-label="Penghargaan">
                        {row.award_code ? (
                          <>
                            <b>{row.award_code}</b>
                            <p className="text-xs muted">
                              {row.award_source === "manual" ? "Ditetapkan manual" : "Otomatis dari peringkat"}
                            </p>
                          </>
                        ) : (
                          <span className="muted">Di luar 9 besar</span>
                        )}
                      </td>
                      <td data-label="Status">
                        <span className={`admin-status ${row.is_published ? "status-approved" : "status-pending"}`}>
                          {row.is_published ? `Diumumkan ${formatDate(row.published_at)}` : "Belum diumumkan"}
                        </span>
                        {row.claim_status && (
                          <span className={`admin-status status-${row.claim_status}`}>
                            Klaim: {claimLabel[row.claim_status] || row.claim_status}
                          </span>
                        )}
                      </td>
                      <td data-label="Operasi">
                        <details className="admin-ops">
                          <summary>Atur</summary>
                          <div className="stack">
                            <AdminControl
                              action="award"
                              id={row.registration_id}
                              compact
                              initial={{ award: row.award_source === "manual" ? row.award_code : "auto" }}
                            />
                            {row.award_code && (
                              <AdminControl
                                action="result_publish"
                                id={row.registration_id}
                                published={row.is_published}
                                compact
                              />
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Claims: every announced winner with invoice state and one-tap actions. */
export function ClaimsBoard({ rows }: { rows: BoardRow[] }) {
  const winners = rows.filter((row) => row.award_code && row.is_published);
  if (!winners.length)
    return (
      <p className="notice">
        Belum ada juara yang diumumkan. Umumkan juara di menu Juara & Hasil;
        invoice klaim Rp120.000 terbit otomatis dan langsung tampil di Cek
        Status peserta.
      </p>
    );
  const paid = winners.filter((row) => row.claim_status === "paid").length;
  const waiting = winners.filter((row) => row.claim_status === "issued").length;
  return (
    <div className="stack">
      <div className="admin-summary-grid grid3">
        <div className="card">
          <span className="muted">Juara diumumkan</span>
          <h2 className="mt-3 text-purple">{winners.length}</h2>
        </div>
        <div className="card">
          <span className="muted">Menunggu pembayaran klaim</span>
          <h2 className="mt-3 text-purple">{waiting}</h2>
        </div>
        <div className="card">
          <span className="muted">Klaim lunas</span>
          <h2 className="mt-3 text-purple">{paid}</h2>
        </div>
      </div>
      <div className="card overflow-x-auto admin-responsive-table">
        <table>
          <thead>
            <tr>
              <th>Juara</th>
              <th>Penghargaan</th>
              <th>Invoice</th>
              <th>Operasi</th>
            </tr>
          </thead>
          <tbody>
            {winners.map((row) => (
              <tr key={row.registration_id}>
                <td data-label="Juara">
                  <Link className="text-purple font-bold underline" href={`/admin/peserta/${row.registration_id}`}>
                    {row.full_name}
                  </Link>
                  <p className="text-xs">{row.public_name} · {row.regency_name}</p>
                  <p className="text-xs break-all">{row.registration_code}</p>
                  <p className="text-xs muted">WA {row.whatsapp}</p>
                </td>
                <td data-label="Penghargaan">
                  <Medal size={16} aria-hidden="true" /> <b>{row.award_code}</b>
                  <p className="text-xs muted">
                    {competitions[row.competition_type]} · {categories[row.category]}
                  </p>
                </td>
                <td data-label="Invoice">
                  {row.invoice_number ? (
                    <>
                      <p className="text-xs break-all">
                        <Receipt size={14} aria-hidden="true" /> {row.invoice_number}
                      </p>
                      <span className={`admin-status status-${row.claim_status}`}>
                        {claimLabel[row.claim_status || ""] || row.claim_status}
                      </span>
                      {row.claim_paid_at && (
                        <p className="text-xs muted">Lunas {formatDate(row.claim_paid_at)}</p>
                      )}
                    </>
                  ) : (
                    <span className="muted">Belum ada invoice</span>
                  )}
                </td>
                <td data-label="Operasi" className="min-w-64">
                  <div className="stack">
                    {!row.invoice_number ? (
                      <AdminControl action="invoice" id={row.registration_id} compact />
                    ) : row.claim_status === "issued" ? (
                      <>
                        <AdminControl action="claim_paid" id={row.registration_id} compact />
                        <details className="admin-ops">
                          <summary>Ubah status lain</summary>
                          <AdminControl
                            action="claim_status"
                            id={row.registration_id}
                            compact
                            initial={{ status: row.claim_status }}
                          />
                        </details>
                      </>
                    ) : (
                      <AdminControl
                        action="claim_status"
                        id={row.registration_id}
                        compact
                        initial={{ status: row.claim_status }}
                      />
                    )}
                    {row.claim_status === "paid" && (
                      <Link className="btn secondary" href="/admin/pengiriman">
                        <Truck size={16} /> Atur pengiriman
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Shipping: winners whose claim is paid, with courier + tracking that shows up on Cek Status. */
export function ShippingBoard({ rows }: { rows: BoardRow[] }) {
  const ready = rows.filter((row) => row.claim_status === "paid");
  const pendingClaims = rows.filter((row) => row.is_published && row.claim_status !== "paid").length;
  if (!ready.length)
    return (
      <p className="notice">
        Belum ada klaim yang lunas. Pengiriman dapat diatur setelah klaim
        hadiah ditandai lunas di menu Klaim Hadiah
        {pendingClaims ? ` (${pendingClaims} juara masih menunggu pembayaran klaim)` : ""}.
      </p>
    );
  const shipped = ready.filter((row) => row.shipping_status === "shipped" || row.shipping_status === "delivered").length;
  return (
    <div className="stack">
      <div className="admin-summary-grid grid3">
        <div className="card">
          <span className="muted">Siap dikirim</span>
          <h2 className="mt-3 text-purple">{ready.length - shipped}</h2>
        </div>
        <div className="card">
          <span className="muted">Sudah dikirim / diterima</span>
          <h2 className="mt-3 text-purple">{shipped}</h2>
        </div>
        <div className="card">
          <span className="muted">Menunggu klaim lunas</span>
          <h2 className="mt-3 text-purple">{pendingClaims}</h2>
        </div>
      </div>
      <div className="card overflow-x-auto admin-responsive-table">
        <table>
          <thead>
            <tr>
              <th>Juara</th>
              <th>Penghargaan</th>
              <th>Pengiriman</th>
              <th>Operasi</th>
            </tr>
          </thead>
          <tbody>
            {ready.map((row) => (
              <tr key={row.registration_id}>
                <td data-label="Juara">
                  <Link className="text-purple font-bold underline" href={`/admin/peserta/${row.registration_id}`}>
                    {row.full_name}
                  </Link>
                  <p className="text-xs">
                    {row.regency_name}, {row.province_name}
                  </p>
                  <p className="text-xs break-all">{row.registration_code}</p>
                  <p className="text-xs muted">
                    <Users size={12} aria-hidden="true" /> WA {row.whatsapp} · alamat lengkap di detail peserta
                  </p>
                </td>
                <td data-label="Penghargaan">
                  <b>{row.award_code}</b>
                  <p className="text-xs muted">
                    {competitions[row.competition_type]} · {categories[row.category]}
                  </p>
                </td>
                <td data-label="Pengiriman">
                  <span className={`admin-status status-${row.shipping_status || "waiting"}`}>
                    {shippingLabel[row.shipping_status || ""] || "Belum diatur"}
                  </span>
                  {row.courier && (
                    <p className="text-xs">
                      {row.courier} · {row.tracking_number || "resi belum ada"}
                    </p>
                  )}
                  {row.shipped_at && (
                    <p className="text-xs muted">Dikirim {formatDate(row.shipped_at)}</p>
                  )}
                </td>
                <td data-label="Operasi" className="min-w-64">
                  <AdminControl
                    action="shipment"
                    id={row.registration_id}
                    compact
                    initial={{
                      courier: row.courier,
                      tracking_number: row.tracking_number,
                      shipping_status: row.shipping_status || "prepared",
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
