import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import type { Habit, HabitRecord, HabitFrequency } from '../types'

const HABIT_COLORS = ['#7c6fea', '#f093a0', '#67c5e3', '#5cc9a7', '#f5a623', '#e879a8', '#7dc4e4', '#a3be8c']

interface HabitStore {
  habits: Habit[]
  records: HabitRecord[]
  addHabit: (name: string, icon: string, frequency?: HabitFrequency) => void
  archiveHabit: (id: string) => void
  toggleRecord: (habitId: string, date: string) => void
  getRecordsForDate: (date: string) => HabitRecord[]
  getStreak: (habitId: string) => number
  isHabitScheduledForDate: (habitId: string, date: string) => boolean
  getWeekCompletionRate: (habitId: string) => number
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      records: [],
      addHabit: (name, icon, frequency = { type: 'daily' }) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: nanoid(),
              name,
              icon,
              color: HABIT_COLORS[state.habits.length % HABIT_COLORS.length],
              frequency,
              createdAt: Date.now(),
            },
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
        const habit = get().habits.find((h) => h.id === habitId)
        const records = get().records.filter((r) => r.habitId === habitId)
        const dates = new Set(records.map((r) => r.date))
        let streak = 0
        const today = dayjs()
        for (let i = 0; i < 365; i++) {
          const d = today.subtract(i, 'day')
          const key = d.format('YYYY-MM-DD')
          // Skip days that are not scheduled for this habit
          if (habit && !isScheduled(habit.frequency, d.day())) {
            continue
          }
          if (dates.has(key)) {
            streak++
          } else {
            break
          }
        }
        return streak
      },
      isHabitScheduledForDate: (habitId, date) => {
        const habit = get().habits.find((h) => h.id === habitId)
        if (!habit) return false
        const dow = dayjs(date).day() // 0=日 1=一 ... 6=六
        return isScheduled(habit.frequency, dow)
      },
      getWeekCompletionRate: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId)
        if (!habit) return 0
        const records = get().records.filter((r) => r.habitId === habitId)
        const dates = new Set(records.map((r) => r.date))

        const today = dayjs()
        const startOfWeek = today.startOf('week') // Sunday
        let scheduled = 0
        let completed = 0
        for (let i = 0; i < 7; i++) {
          const d = startOfWeek.add(i, 'day')
          if (d.isAfter(today, 'day')) break
          if (isScheduled(habit.frequency, d.day())) {
            scheduled++
            if (dates.has(d.format('YYYY-MM-DD'))) completed++
          }
        }
        return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0
      },
    }),
    {
      name: 'dayflow_habits',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as HabitStore
        if (version === 0) {
          state.habits = state.habits.map((h) => ({
            ...h,
            frequency: (h as Habit).frequency ?? { type: 'daily' as const },
          }))
        }
        return state
      },
    }
  )
)

function isScheduled(frequency: HabitFrequency, dow: number): boolean {
  if (frequency.type === 'daily') return true
  return frequency.days.includes(dow)
}
