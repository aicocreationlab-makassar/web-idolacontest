export default function Loading() {
  return (
    <div
      className="page-skeleton wrap section"
      role="status"
      aria-label="Memuat halaman"
    >
      <span className="sr-only">Memuat halaman…</span>
      <div className="skeleton skeleton-pill" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton skeleton-copy short" />
      <div className="skeleton-grid">
        {[0, 1, 2].map((item) => (
          <div className="skeleton-card" key={item}>
            <div className="skeleton skeleton-image" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        ))}
      </div>
    </div>
  );
}
