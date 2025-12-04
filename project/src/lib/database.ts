export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
  reminder_shown: boolean;
  created_at: string;
  updated_at: string;
}

class DatabaseService {
  private dbName = 'todoapp_db';
  private storeName = 'tasks';

  private getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const tasks = request.result as Task[];
          resolve(tasks.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
        };
      });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  }

  async addTask(taskData: {
    title: string;
    description?: string;
    due_date?: string;
    due_time?: string;
  }): Promise<Task> {
    try {
      const db = await this.getDb();
      const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const task: Task = {
        id,
        title: taskData.title,
        description: taskData.description || '',
        due_date: taskData.due_date || null,
        due_time: taskData.due_time || null,
        completed: false,
        reminder_shown: false,
        created_at: now,
        updated_at: now,
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(task);

        request.onerror = () => {
          console.error('Add request error:', request.error);
          reject(request.error);
        };
        request.onsuccess = () => {
          resolve(task);
        };
      });
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const db = await this.getDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const getRequest = store.get(id);

        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
          const existingTask = getRequest.result as Task;
          if (!existingTask) {
            reject(new Error('Task not found'));
            return;
          }

          const updatedTask: Task = {
            ...existingTask,
            ...updates,
            updated_at: new Date().toISOString(),
            id: existingTask.id, // Ensure ID doesn't change
          };

          const updateRequest = store.put(updatedTask);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(updatedTask);
        };
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const db = await this.getDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }

  async clearAllTasks(): Promise<void> {
    try {
      const db = await this.getDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to clear tasks:', error);
      throw error;
    }
  }
}

export const database = new DatabaseService();
