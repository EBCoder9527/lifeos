import { useState, useRef, useEffect } from 'react'
import type { Priority } from '../../../types'
import dayjs from 'dayjs' // fix: for date display

const priorityConfig: Record<Priority, { label: string; dot: string }> = {
  high: { label: '高', dot: 'bg-danger' },
  medium: { label: '中', dot: 'bg-warning' },
  low: { label: '低', dot: 'bg-accent' },
}

const priorityOrder: Priority[] = ['high', 'medium', 'low']
const dayLabels = ['一', '二', '三', '四', '五', '六', '日'] // fix: day labels for date picker

interface WeekTaskItemProps {
  id: string
  title: string
  done: boolean
  priority: Priority
  scheduledDate?: string // fix: current scheduled date
  weekDates?: string[]   // fix: week dates for picker
  justDone: boolean
  onToggle: () => void
  onDelete: () => void
  onMove?: () => void
  onEdit?: (data: { title: string; priority: Priority; scheduledDate?: string }) => void // fix: include scheduledDate
}

export function WeekTaskItem({ title, done, priority, scheduledDate, weekDates, justDone, onToggle, onDelete, onMove, onEdit }: WeekTaskItemProps) {
  const cfg = priorityConfig[priority]
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editPriority, setEditPriority] = useState(priority)
  const [editDate, setEditDate] = useState(scheduledDate) // fix: date edit state
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSaveEdit = () => {
    const trimmed = editTitle.trim()
    if (trimmed && onEdit) {
      onEdit({ title: trimmed, priority: editPriority, scheduledDate: editDate }) // fix: include scheduledDate
    }
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(title)
    setEditPriority(priority)
    setEditDate(scheduledDate) // fix: reset date on cancel
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-4 py-3 space-y-2 animate-fade-in">
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit()
            if (e.key === 'Escape') handleCancelEdit()
          }}
          className="input !py-2 text-sm"
        />
        <div className="flex items-center gap-2">
          {priorityOrder.map((p) => (
            <button
              key={p}
              onClick={() => setEditPriority(p)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                editPriority === p
                  ? `${priorityConfig[p].dot.replace('bg-', 'bg-')}/20 text-text-primary dark:text-text-primary-dark border-2 border-current`
                  : 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-2 border-transparent'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${priorityConfig[p].dot}`} />
              {priorityConfig[p].label}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={handleCancelEdit} className="text-xs text-text-tertiary px-2 py-1">取消</button>
          <button onClick={handleSaveEdit} className="text-xs text-primary font-medium px-2 py-1">确定</button>
        </div>
        {/* fix: day picker for scheduledDate editing */}
        {weekDates && weekDates.length > 0 && (
          <div className="flex gap-1">
            {weekDates.map((d, i) => {
              const isSelected = editDate === d
              return (
                <button
                  key={d}
                  onClick={() => setEditDate(isSelected ? undefined : d)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-gray-50 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
                  }`}
                >
                  <div>{dayLabels[i]}</div>
                  <div className="text-[9px] opacity-70">{dayjs(d).format('D')}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${done ? 'opacity-50' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          done
            ? 'bg-success border-success'
            : justDone
              ? 'bg-success border-success animate-check-pop'
              : 'border-gray-200 dark:border-gray-600 hover:border-primary'
        }`}
      >
        {(done || justDone) && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 text-sm cursor-pointer ${done ? 'line-through text-text-tertiary' : 'font-medium'}`}
        onClick={() => {
          if (!done && onEdit) {
            setEditTitle(title)
            setEditPriority(priority)
            setEditDate(scheduledDate) // fix: init date on edit start
            setEditing(true)
          }
        }}
      >
        {title}
      </span>
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} title={cfg.label} />
      {onMove && (
        <button
          onClick={onMove}
          className="text-text-tertiary hover:text-primary transition-colors p-0.5 shrink-0"
          title="移动"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 9l4-4 4 4" /><path d="M9 5v14" /><path d="M15 19l4-4-4-4" /><path d="M19 15H5" />
          </svg>
        </button>
      )}
      <button
        onClick={onDelete}
        className="text-text-tertiary hover:text-danger transition-colors p-0.5 shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
