import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Task, Priority } from '../types'

interface TaskStore {
  tasks: Task[]
  addTask: (title: string, priority?: Priority, category?: string, dueDate?: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  updateTask: (id: string, data: Partial<Pick<Task, 'title' | 'priority' | 'category' | 'dueDate'>>) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (title, priority = 'medium', category, dueDate) =>
        set((state) => ({
          tasks: [
            {
              id: nanoid(),
              title,
              done: false,
              priority,
              category,
              dueDate,
              createdAt: Date.now(),
            },
            ...state.tasks,
          ],
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, done: !t.done, doneAt: !t.done ? Date.now() : undefined }
              : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      updateTask: (id, data) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),
    }),
    { name: 'dayflow_tasks' }
  )
)
