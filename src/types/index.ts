export interface Diary {
  id: string
  date: string
  content: string
  mood: 'happy' | 'calm' | 'sad' | 'angry' | 'tired'
  createdAt: number
  updatedAt: number
}

export interface Habit {
  id: string
  name: string
  icon: string
  createdAt: number
  archivedAt?: number
}

export interface HabitRecord {
  id: string
  habitId: string
  date: string
  createdAt: number
}

export interface Idea {
  id: string
  content: string
  tags: string[]
  createdAt: number
}

export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: number
  doneAt?: number
}

export interface Settings {
  theme: 'light' | 'dark'
}
