import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import TaskColumn from '../components/TaskColumn';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Button from '../components/Button';
import { BoardSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import useAuth from '../hooks/useAuth';
import useTasks from '../hooks/useTasks';
import { STATUSES, STATUS_META } from '../constants';
import './Dashboard.css';

function greetingFor(name) {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = name?.split(' ')[0] || 'there';
  return `${part}, ${first}`;
}

function resolveStatus(over) {
  if (!over) return null;
  if (over.data?.current?.status) return over.data.current.status;
  if (STATUSES.includes(String(over.id))) return String(over.id);
  return null;
}

function collisionDetection(args) {
  const filterActive = (collisions) =>
    collisions.filter((collision) => collision.id !== args.active.id);
  const pointerHits = filterActive(pointerWithin(args));
  if (pointerHits.length) return pointerHits;
  return filterActive(rectIntersection(args));
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading, error, fetchTasks, createTask, updateTask, moveTask, deleteTask } =
    useTasks();
  const [query, setQuery] = useState('');
  const [modalTask, setModalTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, user?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const visibleTasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tasks;
    return tasks.filter((task) => task.title.toLowerCase().includes(needle));
  }, [tasks, query]);

  const counts = useMemo(
    () =>
      STATUSES.reduce((map, status) => {
        map[status] = tasks.filter((task) => task.status === status).length;
        return map;
      }, {}),
    [tasks]
  );

  const openCreate = () => {
    setModalTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setModalTask(task);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    if (saving) return;
    setModalOpen(false);
  }, [saving]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (modalTask) await updateTask(modalTask._id, payload);
      else await createTask(payload);
      setModalOpen(false);
    } catch {
      // Task context already surfaces the error toast.
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (task, status) => {
    if (task.status === status) return;
    try {
      await moveTask(task._id, status, task.status);
    } catch {
      // Rollback and toast are handled in context.
    }
  };

  const handleDragEnd = async (event) => {
    const task = tasks.find((item) => item._id === event.active.id);
    const nextStatus = resolveStatus(event.over);
    if (!task || !nextStatus || task.status === nextStatus) return;
    try {
      await moveTask(task._id, nextStatus, task.status);
    } catch {
      // Rollback and toast are handled in context.
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteTask(pendingDelete._id);
      setPendingDelete(null);
    } catch {
      // Toast is handled in context.
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard__main">
        <div className="dashboard__heading">
          <div>
            <h1>{greetingFor(user?.name)}</h1>
            <p>Keep today&apos;s work moving across the board.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus size={16} />
            New Task
          </Button>
        </div>

        <div className="dashboard__toolbar">
          <div className="stats">
            {STATUSES.map((status) => (
              <div className={`stat stat--${STATUS_META[status].accent}`} key={status}>
                <span>{status}</span>
                <strong>{counts[status]}</strong>
              </div>
            ))}
          </div>
          <label className="search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search tasks by title</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title"
            />
          </label>
        </div>

        {loading ? (
          <BoardSkeleton />
        ) : error && tasks.length === 0 ? (
          <div className="dashboard__error">
            <EmptyState title="Could not load tasks" message={error} />
            <Button variant="ghost" onClick={fetchTasks}>
              Try again
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragEnd={handleDragEnd}
          >
            <div className="board">
              {STATUSES.map((status) => (
                <TaskColumn
                  key={status}
                  status={status}
                  accent={STATUS_META[status].accent}
                  tasks={visibleTasks.filter((task) => task.status === status)}
                  onEdit={openEdit}
                  onDelete={setPendingDelete}
                  onMove={handleMove}
                />
              ))}
            </div>
          </DndContext>
        )}
      </main>

      <TaskModal
        open={modalOpen}
        task={modalTask}
        submitting={saving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this task?"
        message={
          pendingDelete
            ? `"${pendingDelete.title}" will be removed permanently.`
            : 'This cannot be undone.'
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}
