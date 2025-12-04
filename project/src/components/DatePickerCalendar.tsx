import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../lib/database';

interface DatePickerCalendarProps {
  selectedDate: string | Date | null;
  onDateSelect: (date: Date) => void;
  tasks?: Task[];
}

const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({ selectedDate, onDateSelect, tasks = [] }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (!selectedDate) {
      return new Date(today.getFullYear(), today.getMonth(), 1);
    }
    if (selectedDate instanceof Date) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    return new Date(selectedDate + 'T00:00:00');
  });

  // Create a map of dates to task counts
  const taskCountByDate = useMemo(() => {
    const countMap: { [key: string]: number } = {};
    tasks.forEach((task) => {
      if (task.due_date) {
        countMap[task.due_date] = (countMap[task.due_date] || 0) + 1;
      }
    });
    return countMap;
  }, [tasks]);

  // Helper function to get date string in local timezone (YYYY-MM-DD)
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Empty cells for days before the month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(date);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isSelected = (day: number) => {
    if (!selectedDate || !day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = getLocalDateString(date);
    if (selectedDate instanceof Date) {
      const selectedString = getLocalDateString(selectedDate);
      return dateString === selectedString;
    }
    return dateString === selectedDate;
  };

  const isToday = (day: number) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const todayStr = getLocalDateString(today);
    const dateStr = getLocalDateString(date);
    return dateStr === todayStr;
  };

  const isPast = (day: number) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = getLocalDateString(date);
    const todayStr = getLocalDateString(today);
    return dateStr < todayStr;
  };

  const getTaskCount = (day: number): number => {
    if (!day) return 0;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = getLocalDateString(date);
    return taskCountByDate[dateStr] || 0;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {formatMonthYear(currentMonth)}
        </h3>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => day && handleDateClick(day)}
            disabled={!day || (Boolean(day) && isPast(day))}
            className={`
              w-full aspect-square rounded text-sm font-medium transition-all relative
              ${!day ? 'bg-transparent cursor-default' : ''}
              ${day && isPast(day) ? 'text-gray-300 cursor-not-allowed bg-gray-50' : ''}
              ${day && !isPast(day) && !(day && isSelected(day)) && !(day && isToday(day))
                ? 'text-gray-700 hover:bg-sky-100 cursor-pointer'
                : ''
              }
              ${day && isToday(day) ? 'bg-sky-200 text-sky-900 font-bold border border-sky-400' : ''}
              ${day && isSelected(day)
                ? 'bg-sky-500 text-white font-bold border border-sky-600 shadow-md'
                : ''
              }
            `}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span>{day}</span>
              {day && getTaskCount(day) > 0 && (
                <span className={`text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                  isSelected(day)
                    ? 'bg-white text-sky-600'
                    : isToday(day)
                    ? 'bg-sky-400 text-white'
                    : 'bg-orange-400 text-white'
                }`}>
                  {getTaskCount(day)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-2 border-t border-gray-200 text-xs text-gray-600 text-center">
        {selectedDate && (
          <p>
            Selected: <span className="font-semibold text-gray-900">
              {(selectedDate instanceof Date
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
              )}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default DatePickerCalendar;
