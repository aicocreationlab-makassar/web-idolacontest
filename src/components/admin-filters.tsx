import { allCategoryLabels, competitions } from "@/lib/business-rules";
import type { Filters } from "@/lib/admin-data";
import { AdminFilterPanel } from "./admin-filter-panel";

type SeasonOption = { id: string; name: string; is_active?: boolean };

/** Human label of the season a page is showing, for the folded filter line. */
export function seasonLabel(
  value: string | undefined,
  seasons: SeasonOption[],
  activeId: string | null,
  defaultAll = false,
) {
  if (value === "all" || (!value && (defaultAll || !activeId))) return "Semua season";
  const season = seasons.find((s) => s.id === (value || activeId));
  if (!season) return "Semua season";
  return `${season.name}${season.id === activeId ? " · aktif" : ""}`;
}

/**
 * Season choice. Pages default to the active season; pages that default to
 * every season (Pengiriman) pass defaultAll.
 */
export function SeasonSelect({
  seasons,
  value,
  activeId,
  defaultAll = false,
}: {
  seasons: SeasonOption[];
  value?: string;
  activeId: string | null;
  defaultAll?: boolean;
}) {
  const active = seasons.find((s) => s.id === activeId);
  return (
    <label className="field">
      Season
      <select name="season" defaultValue={value ?? ""}>
        {defaultAll || !activeId ? (
          <option value="">Semua season</option>
        ) : (
          <>
            <option value="">Season aktif{active ? ` (${active.name})` : ""}</option>
            <option value="all">Semua season</option>
          </>
        )}
        {seasons.map((s) => (
          <option value={s.id} key={s.id}>
            {s.name}
            {s.is_active ? " · aktif" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

const paymentLabels: Record<string, string> = {
  pending: "Menunggu",
  paid: "Sudah dibayar",
  rejected: "Ditolak",
  refunded: "Dikembalikan",
};
const sourceLabels: Record<string, string> = {
  website: "Website",
  instagram_dm: "Instagram DM",
  admin_manual: "Dicatat admin",
};

export function AdminFilters({
  filters,
  seasons,
  activeId,
  defaultAccess = "",
}: {
  filters: Filters;
  seasons: SeasonOption[];
  activeId: string | null;
  /** Verifikasi Pembayaran lists unverified registrations unless asked otherwise. */
  defaultAccess?: string;
}) {
  const access = filters.access ?? defaultAccess;
  const active =
    (["q", "competition", "category", "payment", "review", "province", "source"] as const)
      .filter((key) => filters[key] && !(key === "source" && filters[key] === "pwa")).length +
    (access && access !== defaultAccess ? 1 : 0);
  return (
    <AdminFilterPanel
      scope={seasonLabel(filters.season, seasons, activeId)}
      active={active}
    >
      <label className="field">
        Nama / kode
        <input name="q" defaultValue={filters.q} placeholder="Nama anak atau IDC-…" />
      </label>
      <SeasonSelect seasons={seasons} value={filters.season} activeId={activeId} />
      <label className="field">
        Status verifikasi
        <select name="access" defaultValue={access || "all"}>
          <option value="registered">Menunggu verifikasi</option>
          <option value="verified">Terverifikasi</option>
          <option value="cancelled">Ditolak</option>
          <option value="all">Semua</option>
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
          {Object.entries(allCategoryLabels).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Pembayaran
        <select name="payment" defaultValue={filters.payment}>
          <option value="">Semua</option>
          {Object.entries(paymentLabels).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
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
          {Object.entries(sourceLabels).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
    </AdminFilterPanel>
  );
}
