import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  YearGoal, QuarterGoal, MonthPlan, WeekPlan, PlanTask,
  GoalCategory, GoalStatus, PlanStatus, Priority,
} from '../types'
import { getCurrentWeekInfo } from '../utils/week'

interface TaskAncestry {
  task: PlanTask
  weekPlan?: WeekPlan
  monthPlan?: MonthPlan
  quarterGoal?: QuarterGoal
  yearGoal?: YearGoal
}

interface PlanStore {
  yearGoals: YearGoal[]
  quarterGoals: QuarterGoal[]
  monthPlans: MonthPlan[]
  weekPlans: WeekPlan[]
  tasks: PlanTask[]

  // Year Goal
  addYearGoal: (data: { year: number; title: string; vision: string; category: GoalCategory }) => string
  updateYearGoal: (id: string, data: Partial<Omit<YearGoal, 'id' | 'createdAt'>>) => void
  deleteYearGoal: (id: string) => void

  // Quarter Goal
  addQuarterGoal: (data: { yearGoalId: string; quarter: 1|2|3|4; year: number; title: string; keyResults: string[] }) => string
  updateQuarterGoal: (id: string, data: Partial<Omit<QuarterGoal, 'id' | 'createdAt'>>) => void
  deleteQuarterGoal: (id: string) => void

  // Month Plan
  addMonthPlan: (data: { quarterGoalId: string | null; year: number; month: number; title: string; description: string }) => string
  updateMonthPlan: (id: string, data: Partial<Omit<MonthPlan, 'id' | 'createdAt'>>) => void
  deleteMonthPlan: (id: string) => void

  // Week Plan
  addWeekPlan: (data: { monthPlanId: string | null; year: number; weekNumber: number; startDate: string; endDate: string; title: string }) => string
  updateWeekPlan: (id: string, data: Partial<Omit<WeekPlan, 'id' | 'createdAt'>>) => void
  deleteWeekPlan: (id: string) => void

  // Task
  addTask: (data: { weekPlanId: string | null; title: string; priority?: Priority; scheduledDate?: string }) => string
  toggleTask: (id: string) => void
  updateTask: (id: string, data: Partial<Omit<PlanTask, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void

  // Computed
  getQuarterGoals: (yearGoalId: string) => QuarterGoal[]
  getMonthPlans: (quarterGoalId: string) => MonthPlan[]
  getWeekPlans: (monthPlanId: string) => WeekPlan[]
  getWeekTasks: (weekPlanId: string) => PlanTask[]
  getYearProgress: (yearGoalId: string) => number
  getQuarterProgress: (quarterGoalId: string) => number
  getMonthProgress: (monthPlanId: string) => number
  getWeekProgress: (weekPlanId: string) => number
  getCurrentWeekPlan: () => WeekPlan | undefined
  getOrCreateCurrentWeekPlan: () => WeekPlan
  getTaskAncestry: (taskId: string) => TaskAncestry | undefined
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      yearGoals: [],
      quarterGoals: [],
      monthPlans: [],
      weekPlans: [],
      tasks: [],

      // ─── Year Goal ───
      addYearGoal: (data) => {
        const id = nanoid()
        const now = Date.now()
        set((s) => ({
          yearGoals: [...s.yearGoals, { id, ...data, status: 'active' as GoalStatus, createdAt: now, updatedAt: now }],
        }))
        return id
      },
      updateYearGoal: (id, data) =>
        set((s) => ({
          yearGoals: s.yearGoals.map((g) => g.id === id ? { ...g, ...data, updatedAt: Date.now() } : g),
        })),
      deleteYearGoal: (id) =>
        set((s) => ({ yearGoals: s.yearGoals.filter((g) => g.id !== id) })),

      // ─── Quarter Goal ───
      addQuarterGoal: (data) => {
        const id = nanoid()
        const now = Date.now()
        set((s) => ({
          quarterGoals: [...s.quarterGoals, { id, ...data, status: 'active' as GoalStatus, createdAt: now, updatedAt: now }],
        }))
        return id
      },
      updateQuarterGoal: (id, data) =>
        set((s) => ({
          quarterGoals: s.quarterGoals.map((g) => g.id === id ? { ...g, ...data, updatedAt: Date.now() } : g),
        })),
      deleteQuarterGoal: (id) =>
        set((s) => ({ quarterGoals: s.quarterGoals.filter((g) => g.id !== id) })),

      // ─── Month Plan ───
      addMonthPlan: (data) => {
        const id = nanoid()
        const now = Date.now()
        set((s) => ({
          monthPlans: [...s.monthPlans, { id, ...data, status: 'active' as PlanStatus, createdAt: now, updatedAt: now }],
        }))
        return id
      },
      updateMonthPlan: (id, data) =>
        set((s) => ({
          monthPlans: s.monthPlans.map((p) => p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p),
        })),
      deleteMonthPlan: (id) =>
        set((s) => ({ monthPlans: s.monthPlans.filter((p) => p.id !== id) })),

      // ─── Week Plan ───
      addWeekPlan: (data) => {
        const id = nanoid()
        const now = Date.now()
        set((s) => ({
          weekPlans: [...s.weekPlans, { id, ...data, reflection: '', status: 'active' as PlanStatus, createdAt: now, updatedAt: now }],
        }))
        return id
      },
      updateWeekPlan: (id, data) =>
        set((s) => ({
          weekPlans: s.weekPlans.map((w) => w.id === id ? { ...w, ...data, updatedAt: Date.now() } : w),
        })),
      deleteWeekPlan: (id) =>
        set((s) => ({ weekPlans: s.weekPlans.filter((w) => w.id !== id) })),

      // ─── Task ───
      addTask: (data) => {
        const id = nanoid()
        set((s) => ({
          tasks: [
            { id, weekPlanId: data.weekPlanId, title: data.title, done: false, priority: data.priority || 'medium', scheduledDate: data.scheduledDate, createdAt: Date.now() },
            ...s.tasks,
          ],
        }))
        return id
      },
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? Date.now() : undefined } : t
          ),
        })),
      updateTask: (id, data) =>
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === id ? { ...t, ...data } : t),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // ─── Computed ───
      getQuarterGoals: (yearGoalId) => get().quarterGoals.filter((q) => q.yearGoalId === yearGoalId),
      getMonthPlans: (quarterGoalId) => get().monthPlans.filter((m) => m.quarterGoalId === quarterGoalId),
      getWeekPlans: (monthPlanId) => get().weekPlans.filter((w) => w.monthPlanId === monthPlanId),
      getWeekTasks: (weekPlanId) => get().tasks.filter((t) => t.weekPlanId === weekPlanId),

      getWeekProgress: (weekPlanId) => {
        const tasks = get().tasks.filter((t) => t.weekPlanId === weekPlanId)
        if (tasks.length === 0) return 0
        return tasks.filter((t) => t.done).length / tasks.length
      },
      getMonthProgress: (monthPlanId) => {
        const weeks = get().weekPlans.filter((w) => w.monthPlanId === monthPlanId)
        if (weeks.length === 0) return 0
        const progresses = weeks.map((w) => get().getWeekProgress(w.id))
        return progresses.reduce((a, b) => a + b, 0) / progresses.length
      },
      getQuarterProgress: (quarterGoalId) => {
        const months = get().monthPlans.filter((m) => m.quarterGoalId === quarterGoalId)
        if (months.length === 0) return 0
        const progresses = months.map((m) => get().getMonthProgress(m.id))
        return progresses.reduce((a, b) => a + b, 0) / progresses.length
      },
      getYearProgress: (yearGoalId) => {
        const quarters = get().quarterGoals.filter((q) => q.yearGoalId === yearGoalId)
        if (quarters.length === 0) return 0
        const progresses = quarters.map((q) => get().getQuarterProgress(q.id))
        return progresses.reduce((a, b) => a + b, 0) / progresses.length
      },

      getCurrentWeekPlan: () => {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const monday = new Date(today)
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
        const mondayStr = monday.toISOString().split('T')[0]
        return get().weekPlans.find((w) => w.startDate === mondayStr)
      },

      getOrCreateCurrentWeekPlan: () => {
        const existing = get().getCurrentWeekPlan()
        if (existing) return existing
        const info = getCurrentWeekInfo()
        const id = get().addWeekPlan({
          monthPlanId: null,
          year: info.year,
          weekNumber: info.weekNumber,
          startDate: info.startDate,
          endDate: info.endDate,
          title: '',
        })
        return get().weekPlans.find((w) => w.id === id)!
      },

      getTaskAncestry: (taskId) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === taskId)
        if (!task) return undefined
        const result: TaskAncestry = { task }
        if (task.weekPlanId) {
          result.weekPlan = state.weekPlans.find((w) => w.id === task.weekPlanId)
          if (result.weekPlan?.monthPlanId) {
            result.monthPlan = state.monthPlans.find((m) => m.id === result.weekPlan!.monthPlanId)
            if (result.monthPlan?.quarterGoalId) {
              result.quarterGoal = state.quarterGoals.find((q) => q.id === result.monthPlan!.quarterGoalId)
              if (result.quarterGoal?.yearGoalId) {
                result.yearGoal = state.yearGoals.find((y) => y.id === result.quarterGoal!.yearGoalId)
              }
            }
          }
        }
        return result
      },
    }),
    { name: 'dayflow_plan' }
  )
)
