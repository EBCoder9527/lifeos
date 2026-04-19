import { db, storage } from './index'
import { getDeviceId } from './device'
import type {
  Diary, Habit, HabitRecord, Idea,
  YearGoal, QuarterGoal, MonthPlan, WeekPlan, PlanTask,
  SyncStatus,
} from './types'

const MIGRATION_FLAG = 'dayflow_migrated_to_dexie'

// Zustand persist 包裹格式：{ state: { ... }, version: number }
interface ZustandPersisted<T> {
  state: T
  version: number
}

// ─── 初始化入口 ──────────────────────────────────────────────

/**
 * 应用初始化函数，需在渲染前调用一次。
 *
 * 1. 确保 Dexie 数据库已打开
 * 2. 确保 deviceId 已生成
 * 3. 初始化 settings（不存在则写入默认值）
 * 4. 执行 localStorage → Dexie 一次性迁移
 */
export async function initApp(): Promise<void> {
  // 1. 打开数据库（Dexie 在首次访问表时自动 open，这里显式确保）
  if (!db.isOpen()) {
    await db.open()
  }

  // 2. deviceId（调用即生成并缓存）
  getDeviceId()

  // 3. settings 初始化
  await storage.settings.get()

  // 4. localStorage → Dexie 迁移（仅一次）
  if (!localStorage.getItem(MIGRATION_FLAG)) {
    await migrateLocalStorageToDexie()
    localStorage.setItem(MIGRATION_FLAG, Date.now().toString())
  }
}


// ─── localStorage → Dexie 迁移 ──────────────────────────────

/** 从 Zustand persist 的 localStorage 条目中提取 state */
function readZustandStore<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as ZustandPersisted<T>
    return parsed.state ?? null
  } catch {
    return null
  }
}

/** 构造 BaseEntity 的公共字段 */
function baseFields(src: { id: string; createdAt?: number; updatedAt?: number }) {
  const now = Date.now()
  return {
    id: src.id,
    createdAt: src.createdAt ?? now,
    updatedAt: src.updatedAt ?? now,
    deletedAt: null,
    _ver: 1,
    _sync: {
      userId: null,
      deviceId: getDeviceId(),
      status: 'local' as SyncStatus,
      lastSyncedAt: null,
    },
  }
}

// 各 store 的 state 类型（对应 Zustand 定义）
interface OldDiaryState { diaries: Array<{ id: string; date: string; content: string; mood?: string; tags?: string[]; createdAt: number; updatedAt?: number }> }
interface OldHabitState { habits: Array<{ id: string; name: string; icon: string; color: string; frequency?: { type: string; days?: number[] }; createdAt: number; archivedAt?: number }>; records: Array<{ id: string; habitId: string; date: string; createdAt: number }> }
interface OldIdeaState { ideas: Array<{ id: string; title?: string; content: string; category?: string; tags: string[]; createdAt: number; updatedAt?: number }> }
interface OldPlanState { yearGoals: Array<Record<string, unknown>>; quarterGoals: Array<Record<string, unknown>>; monthPlans: Array<Record<string, unknown>>; weekPlans: Array<Record<string, unknown>>; tasks: Array<Record<string, unknown>> }
interface OldTaskState { tasks: Array<{ id: string; title: string; done: boolean; priority?: string; category?: string; dueDate?: string; createdAt: number; doneAt?: number }> }
interface OldSettingsState { theme: 'light' | 'dark' }

async function migrateLocalStorageToDexie(): Promise<void> {
  getDeviceId()
  const now = Date.now()

  // ── Diaries ──
  const diaryState = readZustandStore<OldDiaryState>('dayflow_diaries')
  if (diaryState?.diaries?.length) {
    const rows: Diary[] = diaryState.diaries.map((d) => ({
      ...baseFields(d),
      date: d.date,
      content: d.content,
      mood: (d.mood ?? 'calm') as Diary['mood'],
      tags: d.tags ?? [],
    }))
    await db.diaries.bulkPut(rows)
  }

  // ── Habits + HabitRecords ──
  const habitState = readZustandStore<OldHabitState>('dayflow_habits')
  if (habitState?.habits?.length) {
    const habits: Habit[] = habitState.habits.map((h, i) => ({
      ...baseFields({ id: h.id, createdAt: h.createdAt }),
      name: h.name,
      icon: h.icon,
      color: h.color,
      frequency: (h.frequency ?? { type: 'daily' }) as Habit['frequency'],
      sortOrder: i,
      archivedAt: h.archivedAt ?? null,
    }))
    await db.habits.bulkPut(habits)
  }
  if (habitState?.records?.length) {
    const records: HabitRecord[] = habitState.records.map((r) => ({
      ...baseFields({ id: r.id, createdAt: r.createdAt }),
      habitId: r.habitId,
      date: r.date,
      status: 'done' as const,
      value: null,
      note: null,
    }))
    await db.habitRecords.bulkPut(records)
  }

  // ── Ideas ──
  const ideaState = readZustandStore<OldIdeaState>('dayflow_ideas')
  if (ideaState?.ideas?.length) {
    const rows: Idea[] = ideaState.ideas.map((i) => ({
      ...baseFields(i),
      title: i.title ?? i.content.slice(0, 20),
      content: i.content,
      category: (i.category ?? 'idea') as Idea['category'],
      tags: i.tags ?? [],
      isPinned: false,
    }))
    await db.ideas.bulkPut(rows)
  }

  // ── Plan hierarchy ──
  const planState = readZustandStore<OldPlanState>('dayflow_plan')
  if (planState) {
    if (planState.yearGoals?.length) {
      const rows: YearGoal[] = planState.yearGoals.map((g: Record<string, unknown>) => ({
        ...baseFields(g as { id: string; createdAt?: number; updatedAt?: number }),
        year: (g.year ?? new Date().getFullYear()) as number,
        title: (g.title ?? '') as string,
        vision: (g.vision ?? '') as string,
        category: (g.category ?? 'other') as YearGoal['category'],
        status: (g.status ?? 'active') as YearGoal['status'],
      }))
      await db.yearGoals.bulkPut(rows)
    }

    if (planState.quarterGoals?.length) {
      const rows: QuarterGoal[] = planState.quarterGoals.map((g: Record<string, unknown>) => ({
        ...baseFields(g as { id: string; createdAt?: number; updatedAt?: number }),
        yearGoalId: (g.yearGoalId ?? '') as string,
        quarter: (g.quarter ?? 1) as QuarterGoal['quarter'],
        year: (g.year ?? new Date().getFullYear()) as number,
        title: (g.title ?? '') as string,
        keyResults: (g.keyResults ?? []) as string[],
        status: (g.status ?? 'active') as QuarterGoal['status'],
      }))
      await db.quarterGoals.bulkPut(rows)
    }

    if (planState.monthPlans?.length) {
      const rows: MonthPlan[] = planState.monthPlans.map((p: Record<string, unknown>) => ({
        ...baseFields(p as { id: string; createdAt?: number; updatedAt?: number }),
        quarterGoalId: (p.quarterGoalId ?? null) as string | null,
        year: (p.year ?? new Date().getFullYear()) as number,
        month: (p.month ?? 1) as number,
        title: (p.title ?? '') as string,
        description: (p.description ?? '') as string,
        status: (p.status ?? 'active') as MonthPlan['status'],
      }))
      await db.monthPlans.bulkPut(rows)
    }

    if (planState.weekPlans?.length) {
      const rows: WeekPlan[] = planState.weekPlans.map((w: Record<string, unknown>) => ({
        ...baseFields(w as { id: string; createdAt?: number; updatedAt?: number }),
        monthPlanId: (w.monthPlanId ?? null) as string | null,
        year: (w.year ?? new Date().getFullYear()) as number,
        weekNumber: (w.weekNumber ?? 1) as number,
        startDate: (w.startDate ?? '') as string,
        endDate: (w.endDate ?? '') as string,
        title: (w.title ?? '') as string,
        reflection: (w.reflection ?? '') as string,
        status: (w.status ?? 'active') as WeekPlan['status'],
      }))
      await db.weekPlans.bulkPut(rows)
    }

    // Plan.tasks → Dexie planTasks（done:boolean → status:TaskStatus）
    if (planState.tasks?.length) {
      const rows: PlanTask[] = planState.tasks.map((t: Record<string, unknown>) => {
        const isDone = t.done === true
        return {
          ...baseFields(t as { id: string; createdAt?: number; updatedAt?: number }),
          weekPlanId: (t.weekPlanId ?? null) as string | null,
          title: (t.title ?? '') as string,
          status: isDone ? 'done' as const : 'todo' as const,
          priority: (t.priority ?? 'medium') as PlanTask['priority'],
          category: (t.category ?? null) as string | null,
          scheduledDate: (t.scheduledDate ?? null) as string | null,
          doneAt: isDone ? ((t.doneAt as number) ?? now) : null,
        }
      })
      await db.planTasks.bulkPut(rows)
    }
  }

  // ── Standalone tasks（dayflow_tasks store → 也写入 planTasks，weekPlanId=null）──
  const taskState = readZustandStore<OldTaskState>('dayflow_tasks')
  if (taskState?.tasks?.length) {
    const rows: PlanTask[] = taskState.tasks.map((t) => {
      const isDone = t.done === true
      return {
        ...baseFields({ id: t.id, createdAt: t.createdAt }),
        weekPlanId: null,
        title: t.title,
        status: isDone ? 'done' as const : 'todo' as const,
        priority: (t.priority ?? 'medium') as PlanTask['priority'],
        category: (t.category ?? null) as string | null,
        scheduledDate: (t.dueDate ?? null) as string | null,
        doneAt: isDone ? (t.doneAt ?? now) : null,
      }
    })
    // bulkPut 避免与 plan.tasks 的 id 冲突（nanoid 实际不会冲突，但保险起见用 put）
    await db.planTasks.bulkPut(rows)
  }

  // ── Settings ──
  const settingsState = readZustandStore<OldSettingsState>('dayflow_settings')
  if (settingsState) {
    await storage.settings.update({
      theme: settingsState.theme === 'dark' ? 'dark' : 'light',
    })
  }
}
