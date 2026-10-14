import './Loader.css';

export function Loader({ label = 'Loading' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="board" aria-hidden="true">
      {[0, 1, 2].map((column) => (
        <div className="skeleton-column" key={column}>
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--card" />
          <div className="skeleton skeleton--card" />
        </div>
      ))}
    </div>
  );
}
