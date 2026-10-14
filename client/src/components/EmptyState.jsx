import { Inbox } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <div className="empty">
      <Inbox size={18} aria-hidden="true" />
      <p className="empty__title">{title}</p>
      {message ? <p className="empty__message">{message}</p> : null}
    </div>
  );
}
