import type { Priority } from '../../../types'

const priorityConfig: Record<Priority, { label: string; dot: string }> = {
  high: { label: '高', dot: 'bg-danger' },
  medium: { label: '中', dot: 'bg-warning' },
  low: { label: '低', dot: 'bg-accent' },
}

interface WeekTaskItemProps {
  id: string
  title: string
  done: boolean
  priority: Priority
  justDone: boolean
  onToggle: () => void
  onDelete: () => void
  onMove?: () => void
}

export function WeekTaskItem({ title, done, priority, justDone, onToggle, onDelete, onMove }: WeekTaskItemProps) {
  const cfg = priorityConfig[priority]

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
      <span className={`flex-1 text-sm ${done ? 'line-through text-text-tertiary' : 'font-medium'}`}>
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
