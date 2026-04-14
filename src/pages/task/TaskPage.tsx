import { useState } from 'react'
import { useTaskStore } from '../../stores/task'
import dayjs from 'dayjs'

type Filter = 'all' | 'active' | 'done'

export default function TaskPage() {
  const { tasks, toggleTask } = useTaskStore()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'done', label: '已完成' },
  ]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">计划</h2>
      </div>

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

      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-600 py-20">
          <p className="text-4xl mb-3">📋</p>
          <p>{filter === 'done' ? '还没有完成的任务' : '没有任务'}</p>
          <p className="text-sm mt-1">添加一个小目标</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-left"
            >
              <span className="text-xl">{task.done ? '✅' : '⬜'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.done ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {dayjs(task.createdAt).format('M/D HH:mm')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
