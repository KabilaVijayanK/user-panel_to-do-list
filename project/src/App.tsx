import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import AddTaskModal from './components/AddTaskModal';
import { useTasks } from './hooks/useTasks';
import { useReminders } from './hooks/useReminders';
import { useToast } from './contexts/ToastContext';
import { playNotificationSound, requestNotificationPermission, showSystemNotification } from './utils/sound';

type ViewType = 'inbox' | 'today' | 'upcoming' | 'completed';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('inbox');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { tasks, loading, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const { showToast } = useToast();

  // Request notification permission on app load
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useReminders({
    tasks,
    onReminderTriggered: (task) => {
      playNotificationSound();
      const message = `Reminder: ${task.title}${task.description ? ' - ' + task.description : ''}`;
      showToast(message, 'reminder');
      
      // Show system notification
      showSystemNotification('Task Reminder', {
        body: task.title,
        tag: `task-${task.id}`,
        requireInteraction: true,
      });
    },
    updateTask,
  });

  const filteredTasks = useMemo(() => {
  const todayStr = new Date().toISOString().split('T')[0];

  switch (currentView) {
    case 'today':
      return tasks.filter(
        (task) => task.due_date === todayStr && !task.completed
      );

    case 'upcoming':
      return tasks.filter(
        (task) =>
          task.due_date &&
          task.due_date > todayStr &&
          !task.completed
      );

    case 'completed':
      return tasks.filter((task) => task.completed);

    case 'inbox':
    default:
      return tasks.filter((task) => !task.completed);
  }
}, [tasks, currentView]);


 const taskCounts = useMemo(() => {
  const todayStr = new Date().toISOString().split('T')[0];

  return {
    inbox: tasks.filter((task) => !task.completed).length,

    today: tasks.filter(
      (task) => task.due_date === todayStr && !task.completed
    ).length,

    upcoming: tasks.filter(
      (task) =>
        task.due_date &&
        task.due_date > todayStr &&
        !task.completed
    ).length,

    completed: tasks.filter((task) => task.completed).length,
  };
}, [tasks]);


  const handleAddTask = async (taskData: {
    title: string;
    description?: string;
    due_date?: string;
    due_time?: string;
  }) => {
    const result = await addTask(taskData);
    if (result.success) {
      showToast('Task added successfully!', 'success');
    } else {
      showToast('Failed to add task. Please try again.', 'error');
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    const result = await toggleComplete(id, completed);
    if (result.success) {
      showToast(completed ? 'Task completed!' : 'Task marked as incomplete', 'success');
    } else {
      showToast('Failed to update task. Please try again.', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    const result = await deleteTask(id);
    if (result.success) {
      showToast('Task deleted successfully', 'success');
    } else {
      showToast('Failed to delete task. Please try again.', 'error');
    }
  };

  const viewTitles: Record<ViewType, string> = {
    inbox: 'Inbox',
    today: 'Today',
    upcoming: 'Upcoming',
    completed: 'Completed',
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        taskCounts={taskCounts}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <TaskList
        tasks={filteredTasks}
        viewTitle={viewTitles[currentView]}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
        onAddClick={() => setIsModalOpen(true)}
        loading={loading}
      />

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTask}
      />
    </div>
    
  );
}

export default App;

