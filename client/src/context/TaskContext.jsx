import { createContext, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios';

export const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.data);
    } catch (err) {
      const message = getErrorMessage(err, 'Could not load tasks');
      setError(message);
      setTasks([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (payload) => {
    try {
      const { data } = await api.post('/tasks', payload);
      setTasks((current) => [data.data, ...current]);
      toast.success('Task created');
      return data.data;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create task'));
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, payload);
      setTasks((current) => current.map((task) => (task._id === id ? data.data : task)));
      toast.success('Task updated');
      return data.data;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update task'));
      throw err;
    }
  }, []);

  const moveTask = useCallback(async (id, status, rollbackStatus) => {
    setTasks((current) => current.map((task) => (task._id === id ? { ...task, status } : task)));
    try {
      const { data } = await api.patch(`/tasks/${id}/status`, { status });
      setTasks((current) => current.map((task) => (task._id === id ? data.data : task)));
    } catch (err) {
      if (rollbackStatus) {
        setTasks((current) =>
          current.map((task) => (task._id === id ? { ...task, status: rollbackStatus } : task))
        );
      }
      toast.error(getErrorMessage(err, 'Could not move task'));
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((current) => current.filter((task) => task._id !== id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete task'));
      throw err;
    }
  }, []);

  const resetTasks = useCallback(() => {
    setTasks([]);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      loading,
      error,
      fetchTasks,
      createTask,
      updateTask,
      moveTask,
      deleteTask,
      resetTasks,
    }),
    [
      tasks,
      loading,
      error,
      fetchTasks,
      createTask,
      updateTask,
      moveTask,
      deleteTask,
      resetTasks,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
