import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, AlignLeft, Search, Tag, Flag } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import DatePickerCalendar from './DatePickerCalendar';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    description?: string;
    due_date?: string;
    due_time?: string;
  }) => Promise<void>;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tasks } = useTasks();

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchTerm, tasks]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setDueTime('');
    }
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setDueDate(dateStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      // Embed priority into description as a short prefix so storage (without schema change) keeps it
      const priorityPrefix = priority === 'low' ? '' : `[${priority.toUpperCase()}] `;
      const finalDescription = (priorityPrefix + (description.trim() || '')).trim() || undefined;

      await onAdd({
        title: title.trim(),
        description: finalDescription,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] transform transition-all overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-sky-500 to-indigo-500 text-white flex-shrink-0">
          <h2 className="text-xl font-bold">Add New Task</h2>
          <button
            onClick={onClose}
            className="p-1 text-white hover:text-gray-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Main form layout with calendar on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: form fields */}
            <div className="lg:col-span-2 space-y-5">
          {/* Search existing tasks */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-gray-800">Search Tasks</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search existing tasks to reuse/duplicate..."
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-auto z-20">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setTitle(s.title);
                        setDescription(s.description || '');
                        if (s.due_date) setDueDate(s.due_date);
                        if (s.due_time) setDueTime(s.due_time);
                        setSearchTerm('');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-sky-50"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-sky-500" />
                        <div className="truncate">
                          <div className="font-medium text-sm text-gray-800">{s.title}</div>
                          {s.description && <div className="text-xs text-gray-500 truncate">{s.description}</div>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Buy groceries"
              className="
                w-full px-4 py-3 text-sm border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                transition-all duration-200
              "
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4" />
                <span>Description (Optional)</span>
              </div>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your task..."
              rows={3}
              className="
                w-full px-4 py-3 text-sm border border-gray-300 rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                transition-all duration-200
              "
            />
          </div>

          {/* Priority selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setPriority('low')} className={`px-3 py-2 rounded-lg border ${priority==='low' ? 'bg-sky-50 border-sky-300' : 'bg-white border-gray-200'} text-sm flex items-center gap-2`}>
                <Flag className="w-4 h-4 text-sky-400" /> Low
              </button>
              <button type="button" onClick={() => setPriority('medium')} className={`px-3 py-2 rounded-lg border ${priority==='medium' ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'} text-sm flex items-center gap-2`}>
                <Flag className="w-4 h-4 text-yellow-400" /> Medium
              </button>
              <button type="button" onClick={() => setPriority('high')} className={`px-3 py-2 rounded-lg border ${priority==='high' ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'} text-sm flex items-center gap-2`}>
                <Flag className="w-4 h-4 text-red-500" /> High
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date</span>
                </div>
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="
                  w-full px-4 py-3 text-sm border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  transition-all duration-200
                "
              />
            </div>

            <div>
              <label htmlFor="dueTime" className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Due Time</span>
                </div>
              </label>
              <input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="
                  w-full px-4 py-3 text-sm border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  transition-all duration-200
                "
              />
            </div>
          </div>
            </div>

            {/* Right column: Calendar widget */}
            <div className="lg:col-span-1 lg:row-span-2">
              <DatePickerCalendar selectedDate={dueDate} onDateSelect={handleDateSelect} />
            </div>
          </div>

          <div className="flex gap-3 pt-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white
                border border-gray-300 rounded-lg hover:bg-gray-50
                transition-all duration-200
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="
                flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600
                rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-all duration-200 shadow-sm hover:shadow-md
              "
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
