import { SlidersHorizontal } from "lucide-react";

/**
 * Filters stay folded at the top of each admin page: the summary line tells
 * which season and how many extra filters are on, the form opens on demand.
 */
export function AdminFilterPanel({
  scope,
  active = 0,
  children,
}: {
  scope: string;
  active?: number;
  children: React.ReactNode;
}) {
  return (
    <details className="admin-filter-panel">
      <summary>
        <SlidersHorizontal aria-hidden="true" />
        <b>Filter</b>
        <span className="admin-filter-scope">{scope}</span>
        {active > 0 && <em>{active} filter aktif</em>}
      </summary>
      <form className="admin-filter-form">
        {children}
        <div className="admin-filter-actions">
          <button className="btn">Terapkan</button>
          <a className="btn secondary" href="?">
            Reset
          </a>
        </div>
      </form>
    </details>
  );
}
