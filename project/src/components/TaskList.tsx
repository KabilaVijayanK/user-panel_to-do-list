import React, { useState, useMemo } from 'react';
import { Plus, Filter, Search, Calendar, Flag } from 'lucide-react';
import TaskItem from './TaskItem';
import DatePickerCalendar from './DatePickerCalendar';
import { Task } from '../lib/database';

interface TaskListProps {
  tasks: Task[];
  viewTitle: string;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  loading: boolean;
}

type FilterType = 'all' | 'pending' | 'completed';

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  viewTitle,
  onToggleComplete,
  onDelete,
  onAddClick,
  loading,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const extractPriority = (task: Task): 'HIGH' | 'MEDIUM' | 'LOW' | null => {
    if (task.description.startsWith('[HIGH]')) return 'HIGH';
    if (task.description.startsWith('[MEDIUM]')) return 'MEDIUM';
    if (task.description.startsWith('[LOW]')) return 'LOW';
    return null;
  };

  // Helper function to get date string in local timezone (YYYY-MM-DD)
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const highPriorityTasks = useMemo(
    () => tasks.filter((t) => !t.completed && extractPriority(t) === 'HIGH'),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply completion filter
    if (filter === 'pending') result = result.filter((t) => !t.completed);
    if (filter === 'completed') result = result.filter((t) => t.completed);

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Apply date filter
    if (selectedDate) {
      const dateStr = getLocalDateString(selectedDate);
      result = result.filter((t) => t.due_date === dateStr);
    }

    return result;
  }, [tasks, filter, searchQuery, selectedDate]);

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex-1 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-12 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{viewTitle}</h1>

          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
                bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                transition-colors duration-200
              "
            >
              <Filter className="w-4 h-4" />
              <span>{filterOptions.find((f) => f.value === filter)?.label}</span>
            </button>

            {showFilterMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value as FilterType);
                        setShowFilterMenu(false);
                      }}
                      className={`
                        w-full text-left px-4 py-2.5 text-sm transition-colors
                        first:rounded-t-lg last:rounded-b-lg
                        ${
                          filter === option.value
                            ? 'bg-red-50 text-red-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300
                bg-white text-gray-900 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Two-column layout for calendar and content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Calendar Sidebar - on right for desktop, top for mobile */}
          <div className="lg:order-last">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20 max-h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-500" />
                  Calendar
                </h3>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <DatePickerCalendar
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
                tasks={tasks}
              />
              {selectedDate && (
                <div className="mt-4 p-3 bg-sky-50 rounded-lg text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Filtered for:</span>
                    <br />
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* High Priority Section */}
            {highPriorityTasks.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Flag className="w-5 h-5 text-red-600" />
                    <h2 className="text-lg font-bold text-red-700">Urgent Tasks</h2>
                    <span className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {highPriorityTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {highPriorityTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onDelete={onDelete}
                        onAddClick={onAddClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Task List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  {searchQuery
                    ? 'No tasks match your search'
                    : selectedDate
                    ? 'No tasks for this date'
                    : filter === 'completed'
                    ? 'No completed tasks yet'
                    : filter === 'pending'
                    ? 'No pending tasks'
                    : 'No tasks yet'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(searchQuery || selectedDate) && 'Try adjusting your filters or search'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                    onAddClick={onAddClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Button */}
        <button
          onClick={onAddClick}
          className="
            mt-4 flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600
            bg-blue-200 rounded-lg transition-all duration-200
            hover:text-black-600 group
          "
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Add task</span>
        </button>
      </div>
    </div>
  );
};

export default TaskList;