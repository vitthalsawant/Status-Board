import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';
import './TaskColumn.css';

export default function TaskColumn({ status, accent, tasks, onEdit, onDelete, onMove }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  return (
    <section className={`column column--${accent} ${isOver ? 'column--over' : ''}`} aria-label={`${status} column`}>
      <header className="column__header">
        <h2>{status}</h2>
        <span className="column__count">{tasks.length}</span>
      </header>
      <div ref={setNodeRef} className="column__body">
        <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <EmptyState title="No tasks here yet" />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
}
