import { LayoutDashboard } from 'lucide-react';
import './AuthLayout.css';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__brand">
        <div className="auth__logo">
          <span className="auth__mark" aria-hidden="true">
            <LayoutDashboard size={18} />
          </span>
          TaskFlow
        </div>
        <div className="auth__copy">
          <h1>Move work forward, one column at a time.</h1>
          <p>
            A focused Kanban board for personal tasks. Capture work, drag it across the
            board, and keep every list scoped to you.
          </p>
        </div>
        <ul className="auth__points">
          <li>Three columns: To-Do, In Progress, and Done</li>
          <li>Drag cards or move them from the keyboard</li>
          <li>Your tasks stay private to your account</li>
        </ul>
      </aside>
      <main className="auth__panel">
        <div className="auth__card">
          <div className="auth__mobile-logo">TaskFlow</div>
          <h2>{title}</h2>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
          <div className="auth__footer">{footer}</div>
        </div>
      </main>
    </div>
  );
}
