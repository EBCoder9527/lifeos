import type { Table } from 'dexie'
import { nanoid } from 'nanoid'
import type { BaseEntity, CreateInput, UpdateInput, SyncStatus } from './types'
import { getDeviceId } from './device'

/**
 * 通用 CRUD 仓库。
 *
 * 所有业务实体 repo 继承此类，自动获得：
 * - 软删除（deletedAt）
 * - 自动更新 updatedAt
 * - 自动递增 _ver
 * - 自动填充 _sync 元数据
 */
export class BaseRepository<T extends BaseEntity> {
  protected table: Table<T, string>
  constructor(table: Table<T, string>) {
    this.table = table
  }

  /** 获取所有未删除记录 */
  async getAll(includeDeleted = false): Promise<T[]> {
    const all = await this.table.toArray()
    return includeDeleted ? all : all.filter((e) => e.deletedAt === null)
  }

  /** 按 ID 获取单条（已删除的返回 undefined） */
  async getById(id: string): Promise<T | undefined> {
    const item = await this.table.get(id)
    if (!item || item.deletedAt !== null) return undefined
    return item
  }

  /** 创建实体，自动填充 BaseEntity 字段，返回 id */
  async add(input: CreateInput<T>): Promise<string> {
    const now = Date.now()
    const entity = {
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      _ver: 1,
      _sync: {
        userId: null,
        deviceId: getDeviceId(),
        status: 'local' as SyncStatus,
        lastSyncedAt: null,
      },
      ...input,
    } as T
    await this.table.add(entity)
    return entity.id
  }

  /** 更新实体，自动刷新 updatedAt 和 _ver */
  async update(id: string, changes: UpdateInput<T>): Promise<void> {
    const existing = await this.table.get(id)
    if (!existing || existing.deletedAt !== null) {
      throw new Error(`Entity not found: ${id}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.table.update(id, {
      ...changes,
      updatedAt: Date.now(),
      _ver: existing._ver + 1,
    } as any)
  }

  /** 软删除 */
  async softDelete(id: string): Promise<void> {
    const existing = await this.table.get(id)
    if (!existing || existing.deletedAt !== null) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.table.update(id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
      _ver: existing._ver + 1,
    } as any)
  }

  /** 批量创建 */
  async bulkAdd(inputs: CreateInput<T>[]): Promise<string[]> {
    const now = Date.now()
    const deviceId = getDeviceId()
    const entities = inputs.map((input) => ({
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      _ver: 1,
      _sync: {
        userId: null,
        deviceId,
        status: 'local' as SyncStatus,
        lastSyncedAt: null,
      },
      ...input,
    })) as T[]
    await this.table.bulkAdd(entities)
    return entities.map((e) => e.id)
  }

  /**
   * 获取自指定时间后更新的所有记录（含已删除）。
   * 用于增量同步。
   */
  async getModifiedSince(timestamp: number): Promise<T[]> {
    return this.table.where('updatedAt').above(timestamp).toArray()
  }

  /** 内部辅助：按条件过滤未删除记录 */
  protected async findWhere(filter: (item: T) => boolean): Promise<T[]> {
    return (await this.table.filter((e) => e.deletedAt === null && filter(e)).toArray())
  }
}
