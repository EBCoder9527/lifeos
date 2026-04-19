import { useState, useRef } from 'react'
import { useTaskStore } from '../../stores/task'
import dayjs from 'dayjs'
import type { Priority } from '../../types'

type Filter = 'all' | 'active' | 'done'

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  high: { label: '高', color: 'bg-danger/10 text-danger', dot: 'bg-danger' },
  medium: { label: '中', color: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  low: { label: '低', color: 'bg-accent/10 text-accent', dot: 'bg-accent' },
}

export default function TaskPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useTaskStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [showInput, setShowInput] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [justDone, setJustDone] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  // 分组: 未完成按优先级，已完成单独
  const activeTasks = filtered.filter((t) => !t.done)
  const doneTasks = filtered.filter((t) => t.done)
  const doneCount = tasks.filter((t) => t.done).length
  const totalCount = tasks.length

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: totalCount },
    { key: 'active', label: '进行中', count: totalCount - doneCount },
    { key: 'done', label: '已完成', count: doneCount },
  ]

  const handleAdd = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    addTask(trimmed, priority)
    setTitle('')
    setPriority('medium')
    inputRef.current?.focus()
  }

  const handleToggle = (id: string, isDone: boolean) => {
    toggleTask(id)
    if (!isDone) {
      setJustDone(id)
      setTimeout(() => setJustDone(null), 700)
    }
  }

  const handleOpen = () => {
    setShowInput(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="p-5 stagger-children">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">计划</h2>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
            {totalCount > 0 ? `${doneCount}/${totalCount} 已完成` : '暂无任务'}
          </p>
        </div>
        <button onClick={handleOpen} className="btn-primary">
          添加
        </button>
      </div>

      {/* 进度 */}
      {totalCount > 0 && (
        <div className="card p-4 mb-5">
          <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-secondary-dark mb-2">
            <span>完成进度</span>
            <span className="font-bold text-primary">{Math.round((doneCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 筛选 */}
      <div className="flex gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${
              filter === f.key
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark border border-gray-100 dark:border-gray-700'
            }`}
          >
            {f.label}{f.count > 0 ? ` ${f.count}` : ''}
          </button>
        ))}
      </div>

      {/* 添加弹层 */}
      {showInput && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowInput(false)}>
          <div className="w-full max-w-lg bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">添加任务</h3>
              <button
                onClick={() => setShowInput(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="输入任务内容..."
              className="input mb-3"
            />
            {/* 优先级 */}
            <div className="mb-4">
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">优先级</p>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                  const cfg = priorityConfig[p]
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        priority === p
                          ? `${cfg.color} border-current`
                          : 'border-transparent bg-gray-50 dark:bg-gray-800 text-text-secondary'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}优先
                    </button>
                  )
                })}
              </div>
            </div>
            <button onClick={handleAdd} disabled={!title.trim()} className="btn-primary w-full !py-3">
              添加任务
            </button>
            <p className="text-[10px] text-text-tertiary mt-2 text-center">按回车可连续添加</p>
          </div>
        </div>
      )}

      {/* 任务列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-5xl mb-4 animate-float">
            {filter === 'active' ? '🎉' : '📋'}
          </div>
          <p className="text-text-secondary dark:text-text-secondary-dark font-medium">
            {filter === 'done' ? '还没有完成的任务' : filter === 'active' ? '全部完成了！' : '没有任务'}
          </p>
          <p className="text-sm text-text-tertiary mt-1">
            {filter === 'active' ? '太棒了，去休息一下吧' : '点击添加开始规划'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* 进行中 */}
          {activeTasks.length > 0 && filter !== 'done' && (
            <div className="space-y-2">
              {activeTasks.map((task) => {
                const cfg = priorityConfig[task.priority || 'medium']
                return (
                  <div key={task.id} className="card flex items-center gap-3 p-4">
                    <button
                      onClick={() => handleToggle(task.id, task.done)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        justDone === task.id
                          ? 'bg-success border-success animate-check-pop'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary'
                      }`}
                    >
                      {justDone === task.id && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`chip ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {dayjs(task.createdAt).format('M/D')}
                        </span>
                      </div>
                    </div>
                    {deleteId === task.id ? (
                      <div className="flex gap-1.5 animate-scale-in">
                        <button onClick={() => { deleteTask(task.id); setDeleteId(null) }}
                          className="text-[10px] bg-danger text-white px-2.5 py-1 rounded-full font-medium">删除</button>
                        <button onClick={() => setDeleteId(null)}
                          className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(task.id)} className="text-text-tertiary hover:text-danger transition-colors p-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* 已完成 */}
          {doneTasks.length > 0 && filter !== 'active' && (
            <div>
              {filter === 'all' && activeTasks.length > 0 && (
                <p className="text-xs font-semibold text-text-tertiary mt-4 mb-2 px-1">已完成</p>
              )}
              <div className="space-y-2">
                {doneTasks.map((task) => (
                  <div key={task.id} className="card flex items-center gap-3 p-4 opacity-60">
                    <button
                      onClick={() => handleToggle(task.id, task.done)}
                      className="w-6 h-6 rounded-full bg-success border-2 border-success flex items-center justify-center shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-through text-text-tertiary truncate">{task.title}</p>
                      <span className="text-[10px] text-text-tertiary">
                        {task.doneAt ? dayjs(task.doneAt).format('M/D HH:mm') + ' 完成' : ''}
                      </span>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-text-tertiary hover:text-danger transition-colors p-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
