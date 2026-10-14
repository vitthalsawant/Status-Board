import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { STATUSES, STATUS_META } from '../constants';
import './TaskCard.css';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TaskCard({ task, onEdit, onDelete, onMove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: 'task', status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const accent = STATUS_META[task.status]?.accent || 'todo';

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'task-card--dragging' : ''}`}
      {...listeners}
    >
      <div className="task-card__top">
        <button
          type="button"
          className="task-card__handle"
          aria-label={`Drag ${task.title}`}
          {...attributes}
        >
          <GripVertical size={16} />
        </button>
        <span className={`badge badge--${accent}`}>{task.status}</span>
        <div className="task-card__actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={`Edit ${task.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onEdit(task)}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--danger"
            aria-label={`Delete ${task.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(task)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <h3 className="task-card__title">{task.title}</h3>
      {task.description ? <p className="task-card__description">{task.description}</p> : null}
      <div className="task-card__footer">
        <time dateTime={task.createdAt}>{formatDate(task.createdAt)}</time>
        <label className="task-card__move">
          <span>Move to</span>
          <select
            value={task.status}
            aria-label={`Move ${task.title} to another column`}
            onPointerDown={(event) => event.stopPropagation()}
            onChange={(event) => onMove(task, event.target.value)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
    </article>
  );
}
