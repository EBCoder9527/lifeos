// ============================================================
//  LifeOS Data Schema v3
//  本地优先、同步就绪、V1 最小可用
// ============================================================

// ─── 基础设施层 ──────────────────────────────────────────────

export type SyncStatus = 'local' | 'pending' | 'synced' | 'conflict'

/**
 * 所有业务实体的基类。
 *
 * - id: nanoid，无冲突
 * - deletedAt: 软删除，null = 存活
 * - _ver: 每次写 +1，用于乐观并发 & 增量同步
 * - _sync: 同步元数据，本地阶段 userId = null
 */
export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null

  _ver: number
  _sync: {
    userId: string | null       // 未登录 = null
    deviceId: string            // 首次启动生成的真实 UUID
    status: SyncStatus
    lastSyncedAt: number | null
  }
}

/** 创建实体时的业务字段输入（不含 BaseEntity 自动字段） */
export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>

/** 更新实体时的部分业务字段 */
export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>


// ─── Diary 日记 ──────────────────────────────────────────────

export type Mood = 'happy' | 'calm' | 'sad' | 'angry' | 'tired'

export interface Diary extends BaseEntity {
  date: string              // 'YYYY-MM-DD'
  content: string
  mood: Mood
  tags: string[]
}


// ─── Habit 习惯 ──────────────────────────────────────────────

export type HabitFrequency =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }  // 0=日 1=一 ... 6=六

export interface Habit extends BaseEntity {
  name: string
  icon: string
  color: string
  frequency: HabitFrequency
  sortOrder: number                 // 列表排序唯一来源
  archivedAt: number | null
}

export type HabitRecordStatus = 'done' | 'partial' | 'skipped'

export interface HabitRecord extends BaseEntity {
  habitId: string                   // → Habit.id
  date: string                      // 'YYYY-MM-DD'
  status: HabitRecordStatus         // V1 只用 'done'
  value: number | null              // 量化值，V1 可不填
  note: string | null               // 打卡备注，V1 可不填
}


// ─── Idea 灵感 ───────────────────────────────────────────────

export type IdeaCategory = 'idea' | 'note' | 'important'

export interface Idea extends BaseEntity {
  title: string
  content: string
  category: IdeaCategory
  tags: string[]
  isPinned: boolean
}


// ─── Plan 计划层级 ───────────────────────────────────────────

export type GoalCategory =
  | 'career' | 'health' | 'learning'
  | 'relationship' | 'finance' | 'hobby' | 'other'

export type GoalStatus = 'active' | 'achieved' | 'paused' | 'abandoned'
export type PlanStatus = 'planning' | 'active' | 'completed' | 'abandoned'
export type Priority = 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'

export interface YearGoal extends BaseEntity {
  year: number
  title: string
  vision: string
  category: GoalCategory
  status: GoalStatus
}

export interface QuarterGoal extends BaseEntity {
  yearGoalId: string
  quarter: 1 | 2 | 3 | 4
  year: number
  title: string
  keyResults: string[]
  status: GoalStatus
}

export interface MonthPlan extends BaseEntity {
  quarterGoalId: string | null
  year: number
  month: number
  title: string
  description: string
  status: PlanStatus
}

export interface WeekPlan extends BaseEntity {
  monthPlanId: string | null
  year: number
  weekNumber: number
  startDate: string
  endDate: string
  title: string
  reflection: string
  status: PlanStatus
}

/**
 * 统一任务实体（合并原 Task + PlanTask）。
 * weekPlanId = null → 独立任务。
 */
export interface PlanTask extends BaseEntity {
  weekPlanId: string | null
  title: string
  status: TaskStatus
  priority: Priority
  category: string | null
  scheduledDate: string | null
  doneAt: number | null
}


// ─── Schedule 日程（V1 简化版）──────────────────────────────

export interface ScheduleEvent extends BaseEntity {
  title: string
  description: string | null
  date: string                      // 'YYYY-MM-DD'
  startTime: string | null          // 'HH:mm'，null = 全天
  endTime: string | null
  isAllDay: boolean
  color: string | null
  remindMinutes: number | null

  // V2 预留
  recurrence: string | null         // V1 始终 null，V2 填 RRULE
  linkedTaskId: string | null       // 关联 PlanTask.id
}


// ─── Settings 应用设置（单例，不继承 BaseEntity）────────────

export interface AppSettings {
  id: string                        // 固定为 'default'
  theme: 'light' | 'dark' | 'system'
  locale: string
  weekStartsOn: 0 | 1
  updatedAt: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'default',
  theme: 'light',
  locale: 'zh-CN',
  weekStartsOn: 1,
  updatedAt: 0,
}


// ─── 导出 / 备份 ────────────────────────────────────────────

export interface DeviceInfo {
  deviceId: string
  platform: string
  appVersion: string
  userAgent: string | null
}

export interface AppExportData {
  schemaVersion: number
  exportedAt: number
  deviceInfo: DeviceInfo
  data: {
    diaries: Diary[]
    habits: Habit[]
    habitRecords: HabitRecord[]
    ideas: Idea[]
    yearGoals: YearGoal[]
    quarterGoals: QuarterGoal[]
    monthPlans: MonthPlan[]
    weekPlans: WeekPlan[]
    tasks: PlanTask[]
    scheduleEvents: ScheduleEvent[]
    settings: AppSettings
  }
}


// ─── Dexie 索引声明 ─────────────────────────────────────────
// 主键 = 第一个字段，后面是索引。
// IndexedDB 不索引 null，所以 deletedAt 不放索引，改用内存过滤。

export const DB_SCHEMA = {
  diaries:          'id, date, mood, updatedAt',
  habits:           'id, sortOrder, archivedAt, updatedAt',
  habitRecords:     'id, habitId, date, [habitId+date], updatedAt',
  ideas:            'id, category, updatedAt',
  yearGoals:        'id, year, status, updatedAt',
  quarterGoals:     'id, yearGoalId, [year+quarter], updatedAt',
  monthPlans:       'id, quarterGoalId, [year+month], updatedAt',
  weekPlans:        'id, monthPlanId, startDate, [year+weekNumber], updatedAt',
  planTasks:        'id, weekPlanId, scheduledDate, status, priority, updatedAt',
  scheduleEvents:   'id, date, updatedAt',
  settings:         'id',
} as const
