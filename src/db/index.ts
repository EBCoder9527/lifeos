import Dexie, { type Table } from 'dexie'
import { BaseRepository } from './base-repo'
import {
  DB_SCHEMA, DEFAULT_SETTINGS,
  type Diary, type Habit, type HabitRecord,
  type Idea, type IdeaCategory,
  type YearGoal, type QuarterGoal, type MonthPlan, type WeekPlan,
  type PlanTask, type TaskStatus,
  type ScheduleEvent,
  type AppSettings,
} from './types'


// ─── Database ────────────────────────────────────────────────

class DayFlowDB extends Dexie {
  diaries!: Table<Diary, string>
  habits!: Table<Habit, string>
  habitRecords!: Table<HabitRecord, string>
  ideas!: Table<Idea, string>
  yearGoals!: Table<YearGoal, string>
  quarterGoals!: Table<QuarterGoal, string>
  monthPlans!: Table<MonthPlan, string>
  weekPlans!: Table<WeekPlan, string>
  planTasks!: Table<PlanTask, string>
  scheduleEvents!: Table<ScheduleEvent, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('dayflow')
    this.version(1).stores(DB_SCHEMA)
  }
}

export const db = new DayFlowDB()


// ─── Diary ───────────────────────────────────────────────────

class DiaryRepository extends BaseRepository<Diary> {
  async getByDate(date: string): Promise<Diary | undefined> {
    const items = await this.table.where('date').equals(date).toArray()
    return items.find((d) => d.deletedAt === null)
  }

  async getByDateRange(start: string, end: string): Promise<Diary[]> {
    return this.table
      .where('date')
      .between(start, end, true, true)
      .filter((d) => d.deletedAt === null)
      .toArray()
  }
}


// ─── Habit ───────────────────────────────────────────────────

class HabitRepository extends BaseRepository<Habit> {
  /** 获取未归档的习惯，按 sortOrder 排序 */
  async getActive(): Promise<Habit[]> {
    return this.table
      .orderBy('sortOrder')
      .filter((h) => h.deletedAt === null && h.archivedAt === null)
      .toArray()
  }

  /** 归档 */
  async archive(id: string): Promise<void> {
    await this.update(id, { archivedAt: Date.now() } as Partial<Omit<Habit, keyof import('./types').BaseEntity>>)
  }

  /** 批量更新排序 */
  async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', this.table, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await this.table.update(orderedIds[i], {
          sortOrder: i,
          updatedAt: Date.now(),
        } as Partial<Habit>)
      }
    })
  }
}


// ─── HabitRecord ─────────────────────────────────────────────

class HabitRecordRepository extends BaseRepository<HabitRecord> {
  async getByDate(date: string): Promise<HabitRecord[]> {
    return this.table
      .where('date')
      .equals(date)
      .filter((r) => r.deletedAt === null)
      .toArray()
  }

  async getByHabit(habitId: string): Promise<HabitRecord[]> {
    return this.table
      .where('habitId')
      .equals(habitId)
      .filter((r) => r.deletedAt === null)
      .toArray()
  }

  /** 查询某习惯某天的记录 */
  async getByHabitAndDate(habitId: string, date: string): Promise<HabitRecord | undefined> {
    const item = await this.table.where('[habitId+date]').equals([habitId, date]).first()
    if (!item || item.deletedAt !== null) return undefined
    return item
  }

  /**
   * 切换打卡：有记录则软删除，无记录则创建。
   * 返回操作后的状态：true = 已打卡，false = 已取消。
   */
  async toggle(habitId: string, date: string): Promise<boolean> {
    const existing = await this.getByHabitAndDate(habitId, date)
    if (existing) {
      await this.softDelete(existing.id)
      return false
    }
    await this.add({ habitId, date, status: 'done', value: null, note: null })
    return true
  }
}


// ─── Idea ────────────────────────────────────────────────────

class IdeaRepository extends BaseRepository<Idea> {
  async getByCategory(category: IdeaCategory): Promise<Idea[]> {
    return this.table
      .where('category')
      .equals(category)
      .filter((i) => i.deletedAt === null)
      .toArray()
  }

  async getPinned(): Promise<Idea[]> {
    return this.findWhere((i) => i.isPinned)
  }

  async togglePin(id: string): Promise<void> {
    const item = await this.getById(id)
    if (!item) return
    await this.update(id, { isPinned: !item.isPinned })
  }
}


// ─── Plan: YearGoal ──────────────────────────────────────────

class YearGoalRepository extends BaseRepository<YearGoal> {
  async getByYear(year: number): Promise<YearGoal[]> {
    return this.table
      .where('year')
      .equals(year)
      .filter((g) => g.deletedAt === null)
      .toArray()
  }

  async getActive(): Promise<YearGoal[]> {
    return this.table
      .where('status')
      .equals('active')
      .filter((g) => g.deletedAt === null)
      .toArray()
  }
}


// ─── Plan: QuarterGoal ──────────────────────────────────────

class QuarterGoalRepository extends BaseRepository<QuarterGoal> {
  async getByYearGoal(yearGoalId: string): Promise<QuarterGoal[]> {
    return this.table
      .where('yearGoalId')
      .equals(yearGoalId)
      .filter((g) => g.deletedAt === null)
      .toArray()
  }
}


// ─── Plan: MonthPlan ─────────────────────────────────────────

class MonthPlanRepository extends BaseRepository<MonthPlan> {
  async getByQuarterGoal(quarterGoalId: string): Promise<MonthPlan[]> {
    return this.table
      .where('quarterGoalId')
      .equals(quarterGoalId)
      .filter((p) => p.deletedAt === null)
      .toArray()
  }

  async getByYearMonth(year: number, month: number): Promise<MonthPlan[]> {
    return this.table
      .where('[year+month]')
      .equals([year, month])
      .filter((p) => p.deletedAt === null)
      .toArray()
  }
}


// ─── Plan: WeekPlan ──────────────────────────────────────────

class WeekPlanRepository extends BaseRepository<WeekPlan> {
  async getByMonthPlan(monthPlanId: string): Promise<WeekPlan[]> {
    return this.table
      .where('monthPlanId')
      .equals(monthPlanId)
      .filter((w) => w.deletedAt === null)
      .toArray()
  }

  async getByStartDate(startDate: string): Promise<WeekPlan | undefined> {
    const items = await this.table.where('startDate').equals(startDate).toArray()
    return items.find((w) => w.deletedAt === null)
  }

  async getByYearWeek(year: number, weekNumber: number): Promise<WeekPlan | undefined> {
    const items = await this.table
      .where('[year+weekNumber]')
      .equals([year, weekNumber])
      .toArray()
    return items.find((w) => w.deletedAt === null)
  }
}


// ─── Task (PlanTask) ─────────────────────────────────────────

class TaskRepository extends BaseRepository<PlanTask> {
  async getByWeekPlan(weekPlanId: string): Promise<PlanTask[]> {
    return this.table
      .where('weekPlanId')
      .equals(weekPlanId)
      .filter((t) => t.deletedAt === null)
      .toArray()
  }

  async getByScheduledDate(date: string): Promise<PlanTask[]> {
    return this.table
      .where('scheduledDate')
      .equals(date)
      .filter((t) => t.deletedAt === null)
      .toArray()
  }

  async getByStatus(status: TaskStatus): Promise<PlanTask[]> {
    return this.table
      .where('status')
      .equals(status)
      .filter((t) => t.deletedAt === null)
      .toArray()
  }

  /** 独立任务（不属于任何周计划） */
  async getStandalone(): Promise<PlanTask[]> {
    return this.findWhere((t) => t.weekPlanId === null)
  }

  /** 更新任务状态，自动填写 doneAt */
  async setStatus(id: string, status: TaskStatus): Promise<void> {
    const doneAt = status === 'done' ? Date.now() : null
    await this.update(id, { status, doneAt })
  }
}


// ─── Schedule ────────────────────────────────────────────────

class ScheduleRepository extends BaseRepository<ScheduleEvent> {
  async getByDate(date: string): Promise<ScheduleEvent[]> {
    return this.table
      .where('date')
      .equals(date)
      .filter((e) => e.deletedAt === null)
      .toArray()
  }

  async getByDateRange(start: string, end: string): Promise<ScheduleEvent[]> {
    return this.table
      .where('date')
      .between(start, end, true, true)
      .filter((e) => e.deletedAt === null)
      .toArray()
  }
}


// ─── Settings（单例，非 BaseEntity）──────────────────────────

class SettingsRepository {
  private table = db.settings

  async get(): Promise<AppSettings> {
    const row = await this.table.get('default')
    if (row) return row
    const settings = { ...DEFAULT_SETTINGS, updatedAt: Date.now() }
    await this.table.add(settings)
    return settings
  }

  async update(changes: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>): Promise<void> {
    await this.get() // 确保存在
    await this.table.update('default', {
      ...changes,
      updatedAt: Date.now(),
    })
  }
}


// ─── 统一入口 ────────────────────────────────────────────────

export const storage = {
  diary:        new DiaryRepository(db.diaries),
  habit:        new HabitRepository(db.habits),
  habitRecord:  new HabitRecordRepository(db.habitRecords),
  idea:         new IdeaRepository(db.ideas),
  plan: {
    yearGoal:     new YearGoalRepository(db.yearGoals),
    quarterGoal:  new QuarterGoalRepository(db.quarterGoals),
    monthPlan:    new MonthPlanRepository(db.monthPlans),
    weekPlan:     new WeekPlanRepository(db.weekPlans),
  },
  task:         new TaskRepository(db.planTasks),
  schedule:     new ScheduleRepository(db.scheduleEvents),
  settings:     new SettingsRepository(),
}
