import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="not-found__code">404</p>
      <h1>This page is not on the board</h1>
      <p>The link may be outdated, or the page may have moved.</p>
      <Link className="not-found__link" to="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
