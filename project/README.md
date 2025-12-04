# TaskFlow - Professional To-Do List App

A beautiful, fully-featured to-do list application inspired by Todoist, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- **Task Management**: Create, complete, and delete tasks with ease
- **Rich Task Details**: Add title, description, due date, and due time to each task
- **Smart Views**:
  - Inbox: All pending tasks
  - Today: Tasks due today or overdue
  - Upcoming: Future tasks
  - Completed: Finished tasks
- **Filter Options**: Filter tasks by all, pending, or completed status
- **Task Reminders**: Automatic popup reminders when tasks are due (with notification sound)
- **Persistent Storage**: All tasks are saved to Supabase database and persist across page reloads

### User Interface
- **Todoist-Inspired Design**: Clean, minimal interface matching Todoist's aesthetic
- **Responsive Layout**: Works seamlessly on mobile, tablet, and desktop
- **Mobile Menu**: Collapsible sidebar for mobile devices
- **Smooth Animations**: Toast notifications and UI transitions
- **Visual Feedback**: Color-coded date badges, overdue indicators, hover effects
- **Task Counts**: Real-time task counts in sidebar navigation

## Project Structure

```
src/
├── components/              # React components
│   ├── Sidebar.tsx         # Left navigation sidebar
│   ├── TaskList.tsx        # Main task list view with filters
│   ├── TaskItem.tsx        # Individual task card
│   ├── AddTaskModal.tsx    # Modal for creating new tasks
│   └── Toast.tsx           # Toast notification component
├── contexts/
│   └── ToastContext.tsx    # Toast notification provider & context
├── hooks/
│   ├── useTasks.ts         # Custom hook for task CRUD operations
│   └── useReminders.ts     # Custom hook for reminder checking system
├── lib/
│   └── supabase.ts         # Supabase client configuration & types
├── utils/
│   └── sound.ts            # Notification sound generator
├── App.tsx                 # Main application component
└── main.tsx                # Application entry point
```

## How It Works

### 1. Data Persistence (Supabase Database)

**File**: `src/lib/supabase.ts`

The app uses Supabase (PostgreSQL) to store tasks. The database schema includes:
- `id`: Unique identifier for each task
- `title`: Task name
- `description`: Optional task details
- `due_date`: Date when task is due
- `due_time`: Time when task is due
- `completed`: Boolean flag for completion status
- `reminder_shown`: Prevents duplicate reminder notifications
- `created_at` / `updated_at`: Timestamps

**Migration**: `supabase/migrations/create_tasks_table.sql`
- Creates the tasks table with proper indexes
- Enables Row Level Security (RLS) with public access policies
- Optimizes queries with indexes on `completed` and `due_date` columns

### 2. Task Operations (CRUD)

**File**: `src/hooks/useTasks.ts`

This custom hook handles all task operations:

- **fetchTasks()**: Loads all tasks from Supabase, ordered by creation date
- **addTask()**: Creates a new task and adds it to the database
- **updateTask()**: Updates task properties (completion status, reminder flag, etc.)
- **deleteTask()**: Removes a task from the database
- **toggleComplete()**: Marks a task as complete or incomplete

All operations automatically update the local state and sync with Supabase.

### 3. Reminder System

**File**: `src/hooks/useReminders.ts`

The reminder system works by:

1. **Periodic Checking**: Every 30 seconds, the hook checks all tasks
2. **Date/Time Comparison**:
   - Combines task's `due_date` and `due_time` into a JavaScript Date object
   - Compares with current system time
   - If the due time has passed (within last 2 minutes) and reminder hasn't been shown
3. **Trigger Notification**:
   - Plays a two-tone notification sound (800Hz + 1000Hz beeps)
   - Displays a purple toast notification with task details
   - Updates the task's `reminder_shown` flag to prevent duplicates
4. **Persistence**: The `reminder_shown` flag is stored in the database, so reminders won't re-trigger after page refresh

**Key Implementation Details**:
```typescript
// Check if task is due
const dueDateTime = new Date(task.due_date + ' ' + task.due_time);
const now = new Date();
const minutesDiff = (dueDateTime - now) / 1000 / 60;

// Trigger if within 0-2 minutes past due time
if (minutesDiff <= 0 && minutesDiff > -2 && !task.reminder_shown) {
  showReminder(task);
  markReminderShown(task.id);
}
```

### 4. Toast Notifications

**Files**: `src/contexts/ToastContext.tsx`, `src/components/Toast.tsx`

Toast notifications appear for:
- **Success** (Green): Task added, completed, or deleted
- **Error** (Red): Operation failures
- **Info** (Blue): General information
- **Reminder** (Purple): Task due time reminders

**How It Works**:
1. ToastProvider creates a context available throughout the app
2. Components call `showToast(message, type)` to display notifications
3. Toasts automatically disappear after 4 seconds (8 seconds for reminders)
4. Each toast includes an icon, message, and close button
5. Multiple toasts stack vertically in the top-right corner

### 5. View Filtering

**File**: `src/App.tsx`

The app filters tasks based on the current view:

```typescript
// Inbox: Show all incomplete tasks
tasks.filter(task => !task.completed)

// Today: Show incomplete tasks due today or earlier
tasks.filter(task => {
  const dueDate = new Date(task.due_date);
  const today = new Date();
  return dueDate <= today && !task.completed;
})

// Upcoming: Show incomplete tasks due in the future
tasks.filter(task => {
  const dueDate = new Date(task.due_date);
  const today = new Date();
  return dueDate > today && !task.completed;
})

// Completed: Show only completed tasks
tasks.filter(task => task.completed)
```

Additionally, each view has its own filter menu:
- **All Tasks**: Shows everything in that view
- **Pending**: Shows only incomplete tasks
- **Completed**: Shows only completed tasks

### 6. Responsive Design

**Mobile Features**:
- Hamburger menu button to toggle sidebar
- Full-screen overlay when sidebar is open
- Touch-friendly button sizes
- Responsive grid layouts for date/time pickers

**Desktop Features**:
- Fixed sidebar always visible
- Wider content area for task lists
- Hover effects on tasks (show delete button)
- Better spacing and typography

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to the local development URL

## Usage Guide

### Adding a Task
1. Click the "+ Add task" button
2. Enter a task title (required)
3. Optionally add a description, due date, and due time
4. Click "Add Task" to save

### Completing a Task
- Click the circle checkbox next to any task
- The task will be marked complete with a green checkmark
- Completed tasks appear in the "Completed" view

### Deleting a Task
- Hover over any task
- Click the trash icon that appears on the right
- Task will be permanently deleted

### Setting Reminders
1. When adding a task, set both a due date and due time
2. When the system time matches the task's due time:
   - A notification sound will play
   - A purple reminder toast will appear
   - The reminder won't trigger again for that task

### Filtering Tasks
- Use the sidebar to switch between Inbox, Today, Upcoming, and Completed views
- Use the filter button in each view to show All, Pending, or Completed tasks

## Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Supabase**: PostgreSQL database and backend
- **Vite**: Build tool and dev server
- **Lucide React**: Icon library
- **Web Audio API**: Notification sounds

## Key Design Decisions

1. **Supabase over LocalStorage**: Provides better scalability, reliability, and the foundation for future multi-device sync
2. **Component Separation**: Each component has a single responsibility for better maintainability
3. **Custom Hooks**: Business logic is separated from UI components
4. **Toast Context**: Centralized notification system accessible from anywhere
5. **Responsive-First**: Mobile and desktop experiences are equally polished
6. **Accessibility**: Proper ARIA labels, keyboard navigation, and semantic HTML

## Future Enhancements

- User authentication and personal task lists
- Task categories and projects
- Task priority levels
- Recurring tasks
- Drag-and-drop task reordering
- Task search and tags
- Dark mode
- Multi-language support
- Browser notifications API for background reminders

## License

MIT License - feel free to use this project for learning or personal use!
