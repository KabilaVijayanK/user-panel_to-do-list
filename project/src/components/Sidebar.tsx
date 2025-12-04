import React from 'react';
import { Inbox, Calendar, CalendarClock, CheckCircle2, Menu, X } from 'lucide-react';

interface SidebarProps {
  currentView: 'inbox' | 'today' | 'upcoming' | 'completed';
  onViewChange: (view: 'inbox' | 'today' | 'upcoming' | 'completed') => void;
  taskCounts: {
    inbox: number;
    today: number;
    upcoming: number;
    completed: number;
  };
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  taskCounts,
  isMobileOpen,
  onMobileToggle,
}) => {
  const menuItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: taskCounts.inbox },
    { id: 'today', label: 'Today', icon: Calendar, count: taskCounts.today },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarClock, count: taskCounts.upcoming },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: taskCounts.completed },
  ];

  return (
    <>
      <button
        onClick={onMobileToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onMobileToggle}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-blue-200 border-r border-gray-200
          flex flex-col z-40 transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">TICKtick</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id as typeof currentView);
                  if (window.innerWidth < 1024) {
                    onMobileToggle();
                  }
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-red-50 text-red-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span
                    className={`
                      px-2 py-0.5 text-xs font-semibold rounded-full
                      ${isActive ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}
                    `}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="px-3 py-2 text-xs text-gray-500">
            <p className="font-semibold mb-1">TICKtick</p>
            <p className="text-gray-400">No projects yet</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
