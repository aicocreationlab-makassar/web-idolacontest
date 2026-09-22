import { categories, competitions } from "@/lib/business-rules";
import type { Filters } from "@/lib/admin-data";
export function AdminFilters({
  filters,
  seasons,
}: {
  filters: Filters;
  seasons: { id: string; name: string }[];
}) {
  return (
    <form className="card grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <label className="field">
        Nama / kode
        <input name="q" defaultValue={filters.q} />
      </label>
      <label className="field">
        Season
        <select name="season" defaultValue={filters.season}>
          <option value="">Semua season</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Lomba
        <select name="competition" defaultValue={filters.competition}>
          <option value="">Semua</option>
          {Object.entries(competitions).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Kategori
        <select name="category" defaultValue={filters.category}>
          <option value="">Semua</option>
          {Object.entries(categories).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Review pendaftaran
        <select name="review" defaultValue={filters.review}>
          <option value="">Semua</option>
          <option value="pending">Menunggu review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>
      <label className="field">
        Pembayaran
        <select name="payment" defaultValue={filters.payment}>
          <option value="">Semua</option>
          {["pending", "paid", "rejected", "refunded"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Provinsi
        <input name="province" defaultValue={filters.province} />
      </label>
      <label className="field">
        Sumber
        <select name="source" defaultValue={filters.source}>
          <option value="">Semua</option>
          {["website", "instagram_dm", "admin_manual"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <button className="btn self-end">Terapkan filter</button>
    </form>
  );
}
