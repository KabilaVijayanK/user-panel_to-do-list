/*
  # Create Tasks Table for To-Do List Application

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key) - Unique identifier for each task
      - `title` (text, required) - Task title/name
      - `description` (text, optional) - Detailed description of the task
      - `due_date` (date, optional) - Date when the task is due
      - `due_time` (time, optional) - Time when the task is due
      - `completed` (boolean, default false) - Whether task is completed
      - `reminder_shown` (boolean, default false) - Track if reminder was already shown
      - `created_at` (timestamptz) - When the task was created
      - `updated_at` (timestamptz) - When the task was last updated

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for public access (since this is a demo app without auth)
    
  3. Important Notes
    - All users can create, read, update, and delete tasks (public access)
    - Tasks include date and time fields for reminder functionality
    - The `reminder_shown` field prevents duplicate reminders
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  due_date date,
  due_time time,
  completed boolean DEFAULT false,
  reminder_shown boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
