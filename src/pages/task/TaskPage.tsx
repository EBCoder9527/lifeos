import { useState, useRef } from 'react'
import { useTaskStore } from '../../stores/task'
import dayjs from 'dayjs'

type Filter = 'all' | 'active' | 'done'

export default function TaskPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useTaskStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [showInput, setShowInput] = useState(false)
  const [title, setTitle] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const doneCount = tasks.filter((t) => t.done).length
  const totalCount = tasks.length

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'done', label: '已完成' },
  ]

  const handleAdd = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    addTask(trimmed)
    setTitle('')
    inputRef.current?.focus()
  }

  const handleOpen = () => {
    setShowInput(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">计划</h2>
        <button
          onClick={handleOpen}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full font-medium"
        >
          + 添加
        </button>
      </div>

      {/* 进度条 */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>已完成 {doneCount}/{totalCount}</span>
            <span>{totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* 筛选 */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 添加任务弹层 */}
      {showInput && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl p-4 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">添加任务</h3>
              <button
                onClick={() => setShowInput(false)}
                className="text-gray-400 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="输入任务内容..."
                className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 placeholder:text-gray-400"
              />
              <button
                onClick={handleAdd}
                disabled={!title.trim()}
                className="bg-blue-600 text-white text-sm px-5 rounded-xl font-medium disabled:opacity-40"
              >
                添加
              </button>
            </div>
            {/* 快捷连续添加提示 */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              按回车可连续添加多个任务
            </p>
          </div>
        </div>
      )}

      {/* 任务列表 */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-600 py-20">
          <p className="text-4xl mb-3">📋</p>
          <p>
            {filter === 'done'
              ? '还没有完成的任务'
              : filter === 'active'
                ? '所有任务都完成了！'
                : '没有任务'}
          </p>
          <p className="text-sm mt-1">
            {filter === 'active' ? '太棒了' : '点击右上角添加一个小目标'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="text-xl shrink-0"
              >
                {task.done ? '✅' : '⬜'}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.done ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {task.done && task.doneAt
                    ? `完成于 ${dayjs(task.doneAt).format('M/D HH:mm')}`
                    : dayjs(task.createdAt).format('M/D HH:mm')}
                </p>
              </div>
              {/* 删除 */}
              {deleteId === task.id ? (
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      deleteTask(task.id)
                      setDeleteId(null)
                    }}
                    className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setDeleteId(null)}
                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteId(task.id)}
                  className="text-xs text-gray-400 shrink-0"
                >
                  删除
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
