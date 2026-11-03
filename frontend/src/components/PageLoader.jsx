export default function PageLoader() {
  return (
    <div
      className="page-loader"
      role="status"
      aria-label="Loading the collection"
      aria-busy="true"
    >
      <span className="sr-only">Finding your next favorite…</span>
      <div className="skeleton-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton skeleton-image" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-short" />
          </div>
        ))}
      </div>
    </div>
  );
}
