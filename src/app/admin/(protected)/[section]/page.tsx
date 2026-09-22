import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import { registrationQuery, type Filters } from "@/lib/admin-data";
import { AdminFilters } from "@/components/admin-filters";
import {
  AdminControl,
  PrivateMedia,
  PurgeSeasonMedia,
} from "@/components/admin-controls";
import { RegistrationForm } from "@/components/registration-form";
import { PageHeading } from "@/components/shared";
const titles: Record<string, string> = {
  dashboard: "Dashboard",
  peserta: "Peserta",
  pendaftaran: "Pendaftaran masuk",
  "tambah-peserta": "Tambah peserta",
  karya: "Review karya",
  penilaian: "Penilaian juri",
  hasil: "Hasil & penghargaan",
  "klaim-hadiah": "Klaim penghargaan",
  pengiriman: "Pengiriman",
  settings: "Pengaturan season",
  audit: "Audit log",
};
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
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
  if (section === "settings") {
    if (profile.role !== "super_admin")
      return (
        <p className="notice">Pengaturan hanya dapat diubah super admin.</p>
      );
    const { data, error } = await db
      .from("seasons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Tidak dapat memuat season.");
    return (
      <>
        <PageHeading title={titles[section]} />
        <div className="grid2">
          {data.map((s) => (
            <div className="card stack" key={s.id}>
              <h3>
                {s.name} {s.is_active ? "· aktif" : ""}
              </h3>
              <AdminControl action="settings" id={s.id} initial={s} />
              <PurgeSeasonMedia id={s.id} />
            </div>
          ))}
        </div>
      </>
    );
  }
  if (section === "audit") {
    const { data, error, count } = await db
      .from("admin_audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + 24);
    if (error) throw new Error("Tidak dapat memuat audit.");
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
  if (section === "karya" || section === "penilaian") {
    let query = db
      .from("submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (section === "penilaian") query = query.eq("status", "approved");
    const { data, error, count } = await query.range(offset, offset + 24);
    if (error) throw new Error("Tidak dapat memuat karya.");
    return (
      <>
        <PageHeading
          title={titles[section]}
          description={
            section === "penilaian"
              ? "Nilai tiap kriteria 0–100. Skor akhir dihitung otomatis menggunakan bobot 30/25/20/15/10."
              : "Approve terlebih dahulu, lalu publikasikan secara terpisah."
          }
        />
        <div className="grid2">
          {data.map((s) => (
            <article className="card stack" key={s.id}>
              <h3>
                {s.submission_type === "coloring" ? "Mewarnai" : "Fotogenik"}
              </h3>
              <p className="text-xs break-all muted">ID karya: {s.id}</p>
              <p>
                {s.status} · {s.publication_status}
              </p>
              <PrivateMedia id={s.id} kind="submission" />
              {section === "penilaian" ? (
                <AdminControl
                  action="score"
                  id={s.id}
                  competition={s.submission_type}
                />
              ) : (
                <>
                  <Link
                    className="text-purple underline"
                    href={`/admin/peserta/${s.registration_id}`}
                  >
                    Detail peserta
                  </Link>
                  {s.publication_status === "approved" ? (
                    <AdminControl action="unpublish" id={s.id} />
                  ) : (
                    <>
                      <AdminControl action="review" id={s.id} />
                      {s.status === "approved" && (
                        <AdminControl action="publish" id={s.id} />
                      )}
                    </>
                  )}
                </>
              )}
            </article>
          ))}
        </div>
        {!data.length && (
          <p className="notice">Belum ada karya untuk ditampilkan.</p>
        )}
        <Pagination page={page} count={count || 0} filters={filters} />
      </>
    );
  }
  const seasons = await db.from("seasons").select("id,name");
  if (seasons.error) throw new Error("Tidak dapat memuat season.");
  if (section === "dashboard") {
    const { data, error } = await db.rpc("admin_dashboard", {
      p_season: filters.season || null,
    });
    if (error) throw new Error("Tidak dapat memuat dashboard.");
    const totals = data as Record<string, unknown>;
    return (
      <>
        <PageHeading
          title="Selamat datang, pengelola."
          description="Pantau perjalanan peserta dari pendaftaran sampai penghargaan tiba."
        />
        <form className="card flex flex-wrap gap-4 mb-6">
          <label className="field">
            Season
            <select name="season" defaultValue={filters.season}>
              <option value="">Semua season</option>
              {seasons.data.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn self-end">Terapkan</button>
        </form>
        <div className="grid3">
          {Object.entries(totals)
            .filter(([, v]) => typeof v === "number")
            .map(([k, v]) => (
              <div className="card" key={k}>
                <span className="muted capitalize">
                  {k.replaceAll("_", " ")}
                </span>
                <h2 className="mt-3 text-purple">{String(v)}</h2>
              </div>
            ))}
        </div>
        <div className="grid2 mt-6">
          {Object.entries(totals)
            .filter(([, v]) => typeof v === "object")
            .map(([k, v]) => (
              <div className="card" key={k}>
                <h3 className="capitalize mb-4">{k.replaceAll("_", " ")}</h3>
                {Object.entries((v ?? {}) as Record<string, number>).map(
                  ([label, n]) => (
                    <p className="flex justify-between" key={label}>
                      <span>{label}</span>
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
  if (error) throw new Error("Tidak dapat memuat peserta.");
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
      <AdminFilters filters={filters} seasons={seasons.data} />
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
                  {r.competition_type}
                  <br />
                  {r.category}
                  <br />
                  {r.registration_source}
                </td>
                <td data-label="Status">
                  <span
                    className={`admin-status status-${r.review_status || "pending"}`}
                  >
                    {r.review_status === "approved"
                      ? "Approved"
                      : r.review_status === "rejected"
                        ? "Rejected"
                        : "Menunggu review"}
                  </span>
                  <span className={`admin-status status-${r.payment_status}`}>
                    Bayar: {r.payment_status}
                  </span>
                  <span
                    className={`admin-status status-${r.registration_status}`}
                  >
                    Akses: {r.registration_status}
                  </span>
                  {(r.results ?? []).map(
                    (x: {
                      id: string;
                      award_code: string;
                      is_published: boolean;
                      final_score: number;
                    }) => (
                      <p key={x.id}>
                        {x.award_code} · {x.final_score} ·{" "}
                        {x.is_published ? "published" : "draft"}
                      </p>
                    ),
                  )}
                  {(r.claim_invoices ?? []).map(
                    (x: {
                      id: string;
                      status: string;
                      invoice_number: string;
                    }) => (
                      <p key={x.id}>
                        {x.invoice_number} · {x.status}
                      </p>
                    ),
                  )}
                  {(r.shipments ?? []).map(
                    (x: {
                      id: string;
                      shipping_status: string;
                      tracking_number: string;
                    }) => (
                      <p key={x.id}>
                        {x.shipping_status} · {x.tracking_number}
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
                    </div>
                  )}{" "}
                  {section === "hasil" && (
                    <div className="stack">
                      <AdminControl action="award" id={r.id} />
                      {(r.results ?? []).length > 0 && (
                        <AdminControl
                          action="result_publish"
                          id={r.id}
                          published={r.results?.[0]?.is_published ?? false}
                        />
                      )}
                    </div>
                  )}
                  {section === "klaim-hadiah" &&
                    ((r.claim_invoices ?? []).length === 0 ? (
                      <AdminControl action="invoice" id={r.id} />
                    ) : r.claim_invoices?.[0]?.status === "issued" ? (
                      <AdminControl action="claim_paid" id={r.id} />
                    ) : (
                      <span>Klaim telah diproses.</span>
                    ))}
                  {section === "pengiriman" && (
                    <AdminControl
                      action="shipment"
                      id={r.id}
                      initial={r.shipments?.[0] || {}}
                    />
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
