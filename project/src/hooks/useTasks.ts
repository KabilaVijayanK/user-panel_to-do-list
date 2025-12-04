import { useState, useEffect, useCallback } from 'react';
import { database, Task } from '../lib/database';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await database.getAllTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: {
    title: string;
    description?: string;
    due_date?: string;
    due_time?: string;
  }) => {
    try {
      const data = await database.addTask(taskData);
      setTasks((prev) => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add task';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const data = await database.updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? data : task))
      );
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await database.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      return { success: false, error: message };
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    return updateTask(id, { completed });
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    refreshTasks: fetchTasks,
  };
}

