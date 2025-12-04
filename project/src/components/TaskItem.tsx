import React from 'react';
import { Trash2, Calendar, Clock, Plus } from 'lucide-react';
import { Task } from '../lib/database';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onAddClick?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onAddClick }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isOverdue = () => {
    if (!task.due_date) return false;
    const now = new Date();
    const dueDateTime = new Date(task.due_date);

    if (task.due_time) {
      const [hours, minutes] = task.due_time.split(':');
      dueDateTime.setHours(parseInt(hours), parseInt(minutes));
    }

    return !task.completed && dueDateTime < now;
  };

  return (
    <div
      className={`
        group flex items-start gap-3 p-4 rounded-lg border
        transition-all duration-200 hover:shadow-md
        ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}
        ${isOverdue() ? 'border-l-4 border-l-red-500' : ''}
      `}
    >
      <button
        onClick={() => onToggleComplete(task.id, !task.completed)}
        className={`
          flex-shrink-0 mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center
          transition-all duration-200 hover:scale-110
          ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-400 hover:border-gray-600'
          }
        `}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={`
            text-sm font-medium transition-all duration-200
            ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}
          `}
        >
          {task.title}
        </h3>

        {task.description && (
          <p
            className={`
              mt-1 text-sm transition-all duration-200
              ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}
            `}
          >
            {task.description}
          </p>
        )}

        {(task.due_date || task.due_time) && (
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {task.due_date && (
              <div
                className={`
                  flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded
                  ${
                    isOverdue()
                      ? 'bg-red-50 text-red-700'
                      : task.completed
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-blue-50 text-blue-700'
                  }
                `}
              >
                <Calendar className="w-3 h-3" />
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}

            {task.due_time && (
              <div
                className={`
                  flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded
                  ${
                    isOverdue()
                      ? 'bg-red-50 text-red-700'
                      : task.completed
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-green-50 text-green-700'
                  }
                `}
              >
                <Clock className="w-3 h-3" />
                <span>{formatTime(task.due_time)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onAddClick?.()}
        className="
          flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400
          hover:text-sky-600 hover:bg-sky-50 rounded transition-all duration-200
        "
        aria-label="Add new task"
        title="Add new task"
      >
        <Plus className="w-4 h-4" />
      </button>

      <button
        onClick={() => onDelete(task.id)}
        className="
          flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400
          hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200
        "
        aria-label="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TaskItem;
