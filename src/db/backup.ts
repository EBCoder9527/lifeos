import { db, storage } from './index'
import { getDeviceId } from './device'
import type {
  AppExportData, AppSettings,
  Diary, Habit, HabitRecord, Idea,
  YearGoal, QuarterGoal, MonthPlan, WeekPlan, PlanTask,
} from './types'

export const SCHEMA_VERSION = 3
const APP_VERSION = '0.0.0'

// ─── Export ─────────────────────────────────────────────────

/** 从所有表读取完整数据（含已删除），组装为 AppExportData */
export async function exportData(): Promise<AppExportData> {
  const [
    diaries, habits, habitRecords, ideas,
    yearGoals, quarterGoals, monthPlans, weekPlans,
    tasks, scheduleEvents, settings,
  ] = await Promise.all([
    storage.diary.getAll(true),
    storage.habit.getAll(true),
    storage.habitRecord.getAll(true),
    storage.idea.getAll(true),
    storage.plan.yearGoal.getAll(true),
    storage.plan.quarterGoal.getAll(true),
    storage.plan.monthPlan.getAll(true),
    storage.plan.weekPlan.getAll(true),
    storage.task.getAll(true),
    storage.schedule.getAll(true),
    storage.settings.get(),
  ])

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    deviceInfo: {
      deviceId: getDeviceId(),
      platform: navigator.platform ?? 'unknown',
      appVersion: APP_VERSION,
      userAgent: navigator.userAgent ?? null,
    },
    data: {
      diaries,
      habits,
      habitRecords,
      ideas,
      yearGoals,
      quarterGoals,
      monthPlans,
      weekPlans,
      tasks,
      scheduleEvents,
      settings,
    },
  }
}

/** 导出并触发浏览器下载，文件名 dayflow-backup-YYYY-MM-DD.json */
export function downloadBackup(): Promise<void> {
  return exportData().then((payload) => {
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const today = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = url
    a.download = `dayflow-backup-${today}.json`
    document.body.appendChild(a)
    a.click()

    // cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  })
}


// ─── Validate ───────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const REQUIRED_DATA_KEYS = [
  'diaries', 'habits', 'habitRecords', 'ideas',
  'yearGoals', 'quarterGoals', 'monthPlans', 'weekPlans',
  'tasks', 'scheduleEvents', 'settings',
] as const

/** 校验导入数据结构完整性 */
export function validateImportData(raw: unknown): ValidationResult {
  const errors: string[] = []

  if (raw === null || typeof raw !== 'object') {
    return { valid: false, errors: ['数据不是有效的 JSON 对象'] }
  }

  const obj = raw as Record<string, unknown>

  // schemaVersion
  if (typeof obj.schemaVersion !== 'number' || obj.schemaVersion < 1) {
    errors.push('缺少有效的 schemaVersion')
  } else if (obj.schemaVersion > SCHEMA_VERSION) {
    errors.push(`schemaVersion ${obj.schemaVersion} 高于当前版本 ${SCHEMA_VERSION}，请升级应用`)
  }

  // exportedAt
  if (typeof obj.exportedAt !== 'number') {
    errors.push('缺少 exportedAt 时间戳')
  }

  // data
  if (obj.data === null || typeof obj.data !== 'object') {
    errors.push('缺少 data 字段')
    return { valid: false, errors }
  }

  const data = obj.data as Record<string, unknown>

  // 逐个校验 data 下的数组
  for (const key of REQUIRED_DATA_KEYS) {
    if (key === 'settings') {
      // settings 是单例对象
      if (data.settings === undefined || data.settings === null || typeof data.settings !== 'object') {
        errors.push(`data.settings 不是有效对象`)
      }
      continue
    }

    if (!Array.isArray(data[key])) {
      errors.push(`data.${key} 不是数组`)
      continue
    }

    // 抽样检查前几条是否有 id
    const arr = data[key] as Record<string, unknown>[]
    for (let i = 0; i < Math.min(arr.length, 3); i++) {
      if (typeof arr[i]?.id !== 'string') {
        errors.push(`data.${key}[${i}] 缺少有效的 id 字段`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}


// ─── Migrate ────────────────────────────────────────────────

// 每个 entity 都可能来自老版本，用 any-record 做兼容处理
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawExport = Record<string, any>

/**
 * V1 → V2
 *
 * 变更摘要：
 * - HabitRecord 新增 status / value / note（V1 只记录打卡事件，无这些字段）
 * - Idea 新增 title / category / isPinned
 * - 所有实体补全 BaseEntity 元字段（_ver / _sync）
 */
function migrateV1ToV2(raw: RawExport): RawExport {
  const now = Date.now()
  const d = raw.data ?? {}

  // --- HabitRecord: 补 status / value / note ---
  const habitRecords = ((d.habitRecords ?? []) as AnyRecord[]).map((r) => ({
    ...r,
    status: r.status ?? 'done',
    value: r.value ?? null,
    note: r.note ?? null,
  }))

  // --- Idea: 补 title / category / isPinned ---
  const ideas = ((d.ideas ?? []) as AnyRecord[]).map((idea) => ({
    ...idea,
    title: idea.title ?? (typeof idea.content === 'string' ? idea.content.slice(0, 20) : ''),
    category: idea.category ?? 'idea',
    isPinned: idea.isPinned ?? false,
  }))

  // --- 所有实体补 BaseEntity 元字段 ---
  const entityKeys = [
    'diaries', 'habits', 'habitRecords', 'ideas',
    'yearGoals', 'quarterGoals', 'monthPlans', 'weekPlans',
    'tasks', 'scheduleEvents',
  ] as const

  const data = { ...d, habitRecords, ideas }
  for (const key of entityKeys) {
    const arr = data[key]
    if (!Array.isArray(arr)) continue
    data[key] = (arr as AnyRecord[]).map((e) => ({
      ...e,
      createdAt: e.createdAt ?? now,
      updatedAt: e.updatedAt ?? now,
      deletedAt: e.deletedAt ?? null,
      _ver: e._ver ?? 1,
      _sync: e._sync ?? {
        userId: null,
        deviceId: getDeviceId(),
        status: 'local',
        lastSyncedAt: null,
      },
    }))
  }

  return { ...raw, schemaVersion: 2, data }
}

/**
 * V2 → V3
 *
 * 变更摘要：
 * - PlanTask: done(boolean) → status(TaskStatus)，新增 doneAt / priority / category / scheduledDate
 * - Habit: 补 sortOrder / archivedAt
 * - ScheduleEvent: 补 V1 简化字段（isAllDay / color / remindMinutes / recurrence / linkedTaskId）
 * - Settings: 改为轻量单例（id='default'），不继承 BaseEntity
 */
function migrateV2ToV3(raw: RawExport): RawExport {
  const now = Date.now()
  const d = raw.data ?? {}

  // --- PlanTask: done:boolean → status:TaskStatus ---
  const tasks = ((d.tasks ?? []) as AnyRecord[]).map((t) => {
    // 如果已有 status 且不是 boolean，说明已是新格式
    if (typeof t.status === 'string') {
      return {
        ...t,
        priority: t.priority ?? 'medium',
        category: t.category ?? null,
        scheduledDate: t.scheduledDate ?? null,
        doneAt: t.doneAt ?? (t.status === 'done' ? (t.updatedAt ?? now) : null),
      }
    }
    // V2 用 done:boolean
    const isDone = t.done === true || t.status === true
    return {
      ...t,
      status: isDone ? 'done' : 'todo',
      priority: t.priority ?? 'medium',
      category: t.category ?? null,
      scheduledDate: t.scheduledDate ?? null,
      doneAt: isDone ? (t.updatedAt ?? now) : null,
      done: undefined, // 移除旧字段
    }
  })

  // --- Habit: 补 sortOrder / archivedAt ---
  const habits = ((d.habits ?? []) as AnyRecord[]).map((h, i) => ({
    ...h,
    sortOrder: h.sortOrder ?? i,
    archivedAt: h.archivedAt ?? null,
  }))

  // --- ScheduleEvent: 补 V1 简化字段 ---
  const scheduleEvents = ((d.scheduleEvents ?? []) as AnyRecord[]).map((e) => ({
    ...e,
    description: e.description ?? null,
    isAllDay: e.isAllDay ?? (e.startTime == null),
    color: e.color ?? null,
    remindMinutes: e.remindMinutes ?? null,
    recurrence: e.recurrence ?? null,
    linkedTaskId: e.linkedTaskId ?? null,
  }))

  // --- Settings: 轻量单例 ---
  const oldSettings = (d.settings ?? {}) as AnyRecord
  const settings: AppSettings = {
    id: 'default',
    theme: oldSettings.theme ?? 'light',
    locale: oldSettings.locale ?? 'zh-CN',
    weekStartsOn: oldSettings.weekStartsOn ?? 1,
    updatedAt: oldSettings.updatedAt ?? now,
  }

  // --- Diary: 补 mood / tags ---
  const diaries = ((d.diaries ?? []) as AnyRecord[]).map((diary) => ({
    ...diary,
    mood: diary.mood ?? 'calm',
    tags: diary.tags ?? [],
  }))

  // --- Idea: 补 isPinned（兜底） ---
  const ideas = ((d.ideas ?? []) as AnyRecord[]).map((idea) => ({
    ...idea,
    isPinned: idea.isPinned ?? false,
  }))

  // --- QuarterGoal: 补 keyResults ---
  const quarterGoals = ((d.quarterGoals ?? []) as AnyRecord[]).map((g) => ({
    ...g,
    keyResults: g.keyResults ?? [],
  }))

  // --- WeekPlan: 补 reflection ---
  const weekPlans = ((d.weekPlans ?? []) as AnyRecord[]).map((w) => ({
    ...w,
    reflection: w.reflection ?? '',
  }))

  return {
    ...raw,
    schemaVersion: 3,
    data: {
      ...d,
      diaries,
      habits,
      ideas,
      quarterGoals,
      weekPlans,
      tasks,
      scheduleEvents,
      settings,
    },
  }
}

/**
 * 版本迁移管道：按 schemaVersion 逐级升级到 SCHEMA_VERSION。
 *
 * 链式结构：v1 → v2 → v3。
 * 新版本只需添加一个 migrateVxToVy 函数 + 注册到 pipeline 即可。
 */
type MigrationFn = (data: RawExport) => RawExport

const MIGRATION_PIPELINE: { from: number; to: number; fn: MigrationFn }[] = [
  { from: 1, to: 2, fn: migrateV1ToV2 },
  { from: 2, to: 3, fn: migrateV2ToV3 },
]

export function migrateData(raw: RawExport): AppExportData {
  let version = raw.schemaVersion ?? 1
  let data = raw

  for (const step of MIGRATION_PIPELINE) {
    if (version < step.to) {
      data = step.fn(data)
      version = step.to
    }
  }

  return data as AppExportData
}


// ─── Dexie → Zustand localStorage 同步 ─────────────────────
// 当前 UI 层仍由 Zustand stores 驱动，它们从 localStorage 水合。
// 导入数据到 Dexie 后必须同步写回 localStorage，否则页面看不到数据。

/** Zustand persist 格式 */
function zustandJSON(state: unknown, version: number): string {
  return JSON.stringify({ state, version })
}

/**
 * 将 Dexie 中的数据同步回 Zustand 的 6 个 localStorage key。
 * Dexie (v3 BaseEntity) → 老 Zustand 类型（只保留 UI 需要的字段）。
 */
function syncDexieToZustandStorage(data: {
  diaries: Diary[]
  habits: Habit[]
  habitRecords: HabitRecord[]
  ideas: Idea[]
  yearGoals: YearGoal[]
  quarterGoals: QuarterGoal[]
  monthPlans: MonthPlan[]
  weekPlans: WeekPlan[]
  tasks: PlanTask[]
  settings: AppSettings
}): void {
  // 过滤掉软删除的记录
  const alive = <T extends { deletedAt: number | null }>(arr: T[]) =>
    arr.filter((e) => e.deletedAt === null)

  // dayflow_diaries — { diaries: Diary[] }
  localStorage.setItem('dayflow_diaries', zustandJSON({
    diaries: alive(data.diaries).map((d) => ({
      id: d.id,
      date: d.date,
      content: d.content,
      mood: d.mood,
      tags: d.tags,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
  }, 1))

  // dayflow_habits — { habits: Habit[], records: HabitRecord[] }
  localStorage.setItem('dayflow_habits', zustandJSON({
    habits: alive(data.habits).map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      frequency: h.frequency,
      createdAt: h.createdAt,
      archivedAt: h.archivedAt ?? undefined,
    })),
    records: alive(data.habitRecords).map((r) => ({
      id: r.id,
      habitId: r.habitId,
      date: r.date,
      createdAt: r.createdAt,
    })),
  }, 1))

  // dayflow_ideas — { ideas: Idea[] }
  localStorage.setItem('dayflow_ideas', zustandJSON({
    ideas: alive(data.ideas).map((i) => ({
      id: i.id,
      title: i.title,
      content: i.content,
      category: i.category,
      tags: i.tags,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    })),
  }, 1))

  // dayflow_plan — { yearGoals, quarterGoals, monthPlans, weekPlans, tasks }
  localStorage.setItem('dayflow_plan', zustandJSON({
    yearGoals: alive(data.yearGoals).map((g) => ({
      id: g.id, year: g.year, title: g.title, vision: g.vision,
      category: g.category, status: g.status,
      createdAt: g.createdAt, updatedAt: g.updatedAt,
    })),
    quarterGoals: alive(data.quarterGoals).map((g) => ({
      id: g.id, yearGoalId: g.yearGoalId, quarter: g.quarter, year: g.year,
      title: g.title, keyResults: g.keyResults, status: g.status,
      createdAt: g.createdAt, updatedAt: g.updatedAt,
    })),
    monthPlans: alive(data.monthPlans).map((p) => ({
      id: p.id, quarterGoalId: p.quarterGoalId, year: p.year, month: p.month,
      title: p.title, description: p.description, status: p.status,
      createdAt: p.createdAt, updatedAt: p.updatedAt,
    })),
    weekPlans: alive(data.weekPlans).map((w) => ({
      id: w.id, monthPlanId: w.monthPlanId, year: w.year, weekNumber: w.weekNumber,
      startDate: w.startDate, endDate: w.endDate, title: w.title,
      reflection: w.reflection, status: w.status,
      createdAt: w.createdAt, updatedAt: w.updatedAt,
    })),
    tasks: alive(data.tasks).filter((t) => t.weekPlanId !== null).map((t) => ({
      id: t.id, weekPlanId: t.weekPlanId, title: t.title,
      done: t.status === 'done', priority: t.priority,
      scheduledDate: t.scheduledDate ?? undefined,
      createdAt: t.createdAt, doneAt: t.doneAt ?? undefined,
    })),
  }, 0))

  // dayflow_tasks — { tasks: Task[] }（独立任务，weekPlanId === null）
  localStorage.setItem('dayflow_tasks', zustandJSON({
    tasks: alive(data.tasks).filter((t) => t.weekPlanId === null).map((t) => ({
      id: t.id, title: t.title,
      done: t.status === 'done', priority: t.priority,
      category: t.category ?? undefined,
      dueDate: t.scheduledDate ?? undefined,
      createdAt: t.createdAt, doneAt: t.doneAt ?? undefined,
    })),
  }, 0))

  // dayflow_settings — { theme }
  localStorage.setItem('dayflow_settings', zustandJSON({
    theme: data.settings.theme === 'dark' ? 'dark' : 'light',
  }, 0))
}


// ─── Import ─────────────────────────────────────────────────

export interface ImportResult {
  success: boolean
  counts: Record<string, number>
}

/**
 * 覆盖导入：解析 JSON 文件 → 校验 → 迁移 → 清空全部表 → 写入。
 * 全部在一个 Dexie 事务中执行，失败自动回滚。
 */
export async function importData(file: File): Promise<ImportResult> {
  // 1. 读取文件
  const text = await file.text()

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('文件不是有效的 JSON 格式')
  }

  // 2. 校验
  const validation = validateImportData(raw)
  if (!validation.valid) {
    throw new Error(`数据校验失败：\n${validation.errors.join('\n')}`)
  }

  // 3. 迁移
  const migrated = migrateData(raw as AppExportData)
  const d = migrated.data

  // 4. 事务：清空 + 写入
  const tables = [
    db.diaries, db.habits, db.habitRecords, db.ideas,
    db.yearGoals, db.quarterGoals, db.monthPlans, db.weekPlans,
    db.planTasks, db.scheduleEvents, db.settings,
  ]

  await db.transaction('rw', tables, async () => {
    // 清空所有表
    await Promise.all(tables.map((t) => t.clear()))

    // 批量写入
    await Promise.all([
      db.diaries.bulkAdd(d.diaries),
      db.habits.bulkAdd(d.habits),
      db.habitRecords.bulkAdd(d.habitRecords),
      db.ideas.bulkAdd(d.ideas),
      db.yearGoals.bulkAdd(d.yearGoals),
      db.quarterGoals.bulkAdd(d.quarterGoals),
      db.monthPlans.bulkAdd(d.monthPlans),
      db.weekPlans.bulkAdd(d.weekPlans),
      db.planTasks.bulkAdd(d.tasks),
      db.scheduleEvents.bulkAdd(d.scheduleEvents),
      db.settings.add(d.settings),
    ])
  })

  // 5. 同步到 Zustand localStorage，让现有 UI 立即可见
  syncDexieToZustandStorage(d)

  return {
    success: true,
    counts: {
      diaries: d.diaries.length,
      habits: d.habits.length,
      habitRecords: d.habitRecords.length,
      ideas: d.ideas.length,
      yearGoals: d.yearGoals.length,
      quarterGoals: d.quarterGoals.length,
      monthPlans: d.monthPlans.length,
      weekPlans: d.weekPlans.length,
      tasks: d.tasks.length,
      scheduleEvents: d.scheduleEvents.length,
    },
  }
}
