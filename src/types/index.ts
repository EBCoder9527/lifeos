export interface Diary {
  id: string
  date: string
  content: string
  mood: 'happy' | 'calm' | 'sad' | 'angry' | 'tired'
  tags: string[]
  createdAt: number
  updatedAt: number
}

export type HabitFrequency =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }  // 0=日 1=一 2=二 ... 6=六

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: HabitFrequency
  createdAt: number
  archivedAt?: number
}

export interface HabitRecord {
  id: string
  habitId: string
  date: string
  createdAt: number
}

export type IdeaCategory = 'idea' | 'note' | 'important'

export interface Idea {
  id: string
  title: string
  content: string
  category: IdeaCategory
  tags: string[]
  createdAt: number
  updatedAt: number
}

export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  done: boolean
  priority: Priority
  category?: string
  dueDate?: string
  createdAt: number
  doneAt?: number
}

export interface Settings {
  theme: 'light' | 'dark'
}

// ─── Plan Hierarchy Types ───

export type GoalCategory = 'career' | 'health' | 'learning' | 'relationship' | 'finance' | 'hobby' | 'other'
export type GoalStatus = 'active' | 'achieved' | 'paused' | 'abandoned'
export type PlanStatus = 'planning' | 'active' | 'completed' | 'abandoned'
export type PlanLayer = 'year' | 'quarter' | 'month' | 'week' | 'task'

export interface YearGoal {
  id: string
  year: number
  title: string
  vision: string
  category: GoalCategory
  status: GoalStatus
  createdAt: number
  updatedAt: number
}

export interface QuarterGoal {
  id: string
  yearGoalId: string
  quarter: 1 | 2 | 3 | 4
  year: number
  title: string
  keyResults: string[]
  status: GoalStatus
  createdAt: number
  updatedAt: number
}

export interface MonthPlan {
  id: string
  quarterGoalId: string | null
  year: number
  month: number
  title: string
  description: string
  status: PlanStatus
  createdAt: number
  updatedAt: number
}

export interface WeekPlan {
  id: string
  monthPlanId: string | null
  year: number
  weekNumber: number
  startDate: string
  endDate: string
  title: string
  reflection: string
  status: PlanStatus
  createdAt: number
  updatedAt: number
}

export interface PlanTask {
  id: string
  weekPlanId: string | null
  title: string
  done: boolean
  priority: Priority
  scheduledDate?: string
  isIndependent?: boolean // fix: mark tasks explicitly removed from week plans
  createdAt: number
  doneAt?: number
}
