import { useEffect, useRef } from 'react';
import { Task } from '../lib/database';

interface UseRemindersProps {
  tasks: Task[];
  onReminderTriggered: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ success: boolean }>;
}

export function useReminders({ tasks, onReminderTriggered, updateTask }: UseRemindersProps) {
  const checkedTasksRef = useRef<Set<string>>(new Set());
  const lastCheckTimeRef = useRef<number>(0);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.getTime();

      // Avoid running checks too frequently (at least 1 second apart)
      if (currentTime - lastCheckTimeRef.current < 1000) {
        return;
      }

      lastCheckTimeRef.current = currentTime;

      tasks.forEach((task) => {
        // Skip if task is completed, reminder already shown, or missing date/time
        if (task.completed || task.reminder_shown || !task.due_date || !task.due_time) {
          return;
        }

        // Skip if already checked in this session
        if (checkedTasksRef.current.has(task.id)) {
          return;
        }

        // Parse date and time
        const [year, month, day] = task.due_date.split('-').map(Number);
        const [hours, minutes] = task.due_time.split(':').map(Number);

        const dueDateTime = new Date(year, month - 1, day, hours, minutes, 0);
        const dueTimeMs = dueDateTime.getTime();

        // Calculate time difference in milliseconds
        const timeDiffMs = Math.abs(dueTimeMs - currentTime);

        // Trigger reminder if current time is within 1 minute before or at the due time
        if (timeDiffMs <= 60000 && dueTimeMs <= currentTime) {
          checkedTasksRef.current.add(task.id);
          onReminderTriggered(task);
          updateTask(task.id, { reminder_shown: true });
        }
      });
    };

    // Check more frequently for better accuracy (every 1 second)
    const intervalId = setInterval(checkReminders, 1000);

    // Initial check
    checkReminders();

    return () => clearInterval(intervalId);
  }, [tasks, onReminderTriggered, updateTask]);

  // Reset checked tasks for completed items
  useEffect(() => {
    const completedTaskIds = tasks
      .filter((task) => task.completed)
      .map((task) => task.id);

    completedTaskIds.forEach((id) => {
      checkedTasksRef.current.delete(id);
    });
  }, [tasks]);
}

