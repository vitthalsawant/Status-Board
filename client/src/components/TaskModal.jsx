import { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { STATUSES } from '../constants';
import Button from './Button';
import Input from './Input';
import './TaskModal.css';

const EMPTY_FORM = { title: '', description: '', status: 'To-Do' };

export default function TaskModal({ open, task, submitting, onClose, onSubmit }) {
  const titleId = useId();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      task
        ? {
            title: task.title,
            description: task.description || '',
            status: task.status,
          }
        : EMPTY_FORM
    );
  }, [open, task]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) nextErrors.title = 'Title is required';
    else if (title.length > 100) nextErrors.title = 'Title cannot exceed 100 characters';
    if (description.length > 500) {
      nextErrors.description = 'Description cannot exceed 500 characters';
    }
    if (!STATUSES.includes(form.status)) nextErrors.status = 'Choose a valid status';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await onSubmit({ title, description, status: form.status });
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id={titleId}>{task ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-btn" aria-label="Close dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          <Input
            id="task-title"
            name="title"
            label="Title"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
            maxLength={100}
            placeholder="What needs to get done?"
          />
          <Input
            id="task-description"
            name="description"
            label="Description"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
            multiline
            maxLength={500}
            placeholder="Add a few details (optional)"
          />
          <div className="field">
            <label className="field__label" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              name="status"
              className="field__input"
              value={form.status}
              onChange={handleChange}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status ? <p className="field__error">{errors.status}</p> : null}
          </div>
          <div className="modal__actions">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {task ? 'Save changes' : 'Create task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
