import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Habit, HabitRecord } from '../types'

interface HabitStore {
  habits: Habit[]
  records: HabitRecord[]
  addHabit: (name: string, icon: string) => void
  archiveHabit: (id: string) => void
  toggleRecord: (habitId: string, date: string) => void
  getRecordsForDate: (date: string) => HabitRecord[]
  getStreak: (habitId: string) => number
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      records: [],
      addHabit: (name, icon) =>
        set((state) => ({
          habits: [
            ...state.habits,
            { id: nanoid(), name, icon, createdAt: Date.now() },
          ],
        })),
      archiveHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, archivedAt: Date.now() } : h
          ),
        })),
      toggleRecord: (habitId, date) =>
        set((state) => {
          const existing = state.records.find(
            (r) => r.habitId === habitId && r.date === date
          )
          if (existing) {
            return { records: state.records.filter((r) => r.id !== existing.id) }
          }
          return {
            records: [
              ...state.records,
              { id: nanoid(), habitId, date, createdAt: Date.now() },
            ],
          }
        }),
      getRecordsForDate: (date) =>
        get().records.filter((r) => r.date === date),
      getStreak: (habitId) => {
        const records = get().records.filter((r) => r.habitId === habitId)
        const dates = new Set(records.map((r) => r.date))
        let streak = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const key = d.toISOString().split('T')[0]
          if (dates.has(key)) {
            streak++
          } else {
            break
          }
        }
        return streak
      },
    }),
    { name: 'dayflow_habits' }
  )
)
