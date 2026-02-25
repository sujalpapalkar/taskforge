import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';

const COLUMNS = ['Todo', 'In Progress', 'Review', 'Done'];

const useTasks = (projectId, filters = {}) => {
  const [tasks, setTasks]     = useState([]);
  const [grouped, setGrouped] = useState({
    'Todo': [], 'In Progress': [], 'Review': [], 'Done': []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchTasks = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await taskService.getByProject(projectId, filters);
      setTasks(data.data.tasks);
      setGrouped(data.data.grouped);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, JSON.stringify(filters)]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (data) => {
    const { data: res } = await taskService.create(projectId, data);
    const task = res.data.task;
    setTasks(prev => [task, ...prev]);
    setGrouped(prev => ({
      ...prev,
      [task.status]: [task, ...(prev[task.status] || [])],
    }));
    return task;
  };

  const updateTask = async (id, updates) => {
    const { data: res } = await taskService.update(id, updates);
    const updated = res.data.task;

    setTasks(prev => prev.map(t => t._id === id ? updated : t));
    setGrouped(prev => {
      const next = { ...prev };
      // Remove from old column
      COLUMNS.forEach(col => {
        next[col] = (next[col] || []).filter(t => t._id !== id);
      });
      // Add to new column
      next[updated.status] = [updated, ...(next[updated.status] || [])];
      return next;
    });
    return updated;
  };

  const deleteTask = async (id) => {
    await taskService.delete(id);
    const task = tasks.find(t => t._id === id);
    setTasks(prev => prev.filter(t => t._id !== id));
    if (task) {
      setGrouped(prev => ({
        ...prev,
        [task.status]: (prev[task.status] || []).filter(t => t._id !== id),
      }));
    }
  };

  const addComment = async (id, content) => {
    const { data: res } = await taskService.addComment(id, content);
    setTasks(prev => prev.map(t =>
      t._id === id ? { ...t, comments: res.data.comments } : t
    ));
    return res.data.comments;
  };

  return {
    tasks,
    grouped,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    addComment,
  };
};

export default useTasks;