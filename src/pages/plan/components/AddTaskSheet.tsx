import { useState, useRef } from 'react'
import type { Priority } from '../../../types'

const priorities: { value: Priority; label: string; dot: string; color: string }[] = [
  { value: 'high', label: '高', dot: 'bg-danger', color: 'bg-danger/10 text-danger' },
  { value: 'medium', label: '中', dot: 'bg-warning', color: 'bg-warning/10 text-warning' },
  { value: 'low', label: '低', dot: 'bg-accent', color: 'bg-accent/10 text-accent' },
]

const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

interface AddTaskSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; priority: Priority; scheduledDate?: string }) => void
  weekDates: string[] // 7 dates, Monday to Sunday
}

export function AddTaskSheet({ open, onClose, onSubmit, weekDates }: AddTaskSheetProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onSubmit({
      title: trimmed,
      priority,
      scheduledDate: selectedDay !== null ? weekDates[selectedDay] : undefined,
    })
    setTitle('')
    setPriority('medium')
    inputRef.current?.focus()
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">添加任务</h3>
          <button
            onClick={onClose}
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
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="输入任务内容..."
          className="input mb-3"
          autoFocus
        />

        {/* Priority */}
        <div className="mb-3">
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">优先级</p>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                  priority === p.value
                    ? `${p.color} border-current`
                    : 'border-transparent bg-gray-50 dark:bg-gray-800 text-text-secondary'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Day picker */}
        <div className="mb-4">
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">安排日期</p>
          <div className="flex gap-1.5">
            {dayLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(selectedDay === i ? null : i)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedDay === i
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-gray-50 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="btn-primary w-full !py-3"
        >
          添加任务
        </button>
        <p className="text-[10px] text-text-tertiary mt-2 text-center">按回车可连续添加</p>
      </div>
    </div>
  )
}
