import { useMemo } from 'react'
import { usePlanStore } from '../stores/plan'
import dayjs from 'dayjs'

interface TaskMoveSheetProps {
  open: boolean
  onClose: () => void
  taskId: string
  currentWeekPlanId?: string | null // fix: kept for interface compat, no longer used for filtering
  onMoved?: (msg: string) => void
}

export function TaskMoveSheet({ open, onClose, taskId, onMoved }: TaskMoveSheetProps) {
  const store = usePlanStore()

  // fix: use task's actual week — independent/orphaned tasks should not exclude any week
  const task = store.tasks.find((t) => t.id === taskId)
  const taskWeekPlanId = (task?.isIndependent || !task?.weekPlanId) ? null : task.weekPlanId

  const weekOptions = useMemo(() => {
    const now = dayjs()
    // Show recent + upcoming weeks (4 past + current + 3 future = 8 weeks)
    return store.weekPlans
      .filter((w) => {
        const diff = dayjs(w.startDate).diff(now, 'week')
        return diff >= -4 && diff <= 3 && w.id !== taskWeekPlanId // fix: exclude task's current week, not page's
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
  }, [store.weekPlans, taskWeekPlanId])

  if (!open) return null

  const handleMove = (targetWeekPlanId: string | null) => {
    // fix: set isIndependent flag for task transfer tracking
    store.updateTask(taskId, {
      weekPlanId: targetWeekPlanId,
      isIndependent: targetWeekPlanId === null,
    })
    if (targetWeekPlanId) {
      const target = store.weekPlans.find((w) => w.id === targetWeekPlanId)
      onMoved?.(`已移动到第${target?.weekNumber ?? ''}周`)
    } else {
      onMoved?.('已移出当前周')
    }
    onClose()
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">移动任务</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-3">选择目标周计划</p>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {weekOptions.map((week) => {
            const isCurrent = week.startDate === dayjs().isoWeekday(1).format('YYYY-MM-DD')
            return (
              <button
                key={week.id}
                onClick={() => handleMove(week.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-primary-soft text-primary ring-1 ring-primary/20'
                    : 'bg-gray-50 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">第{week.weekNumber}周</span>
                    <span className="text-[10px] text-text-tertiary">
                      {dayjs(week.startDate).format('M/D')} - {dayjs(week.endDate).format('M/D')}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white font-medium">本周</span>
                    )}
                  </div>
                  {week.title && (
                    <p className="text-xs text-text-tertiary mt-0.5 truncate">{week.title}</p>
                  )}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )
          })}

          {weekOptions.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-6">没有其他周计划可以移动到</p>
          )}

          {/* Remove from week */}
          <button
            onClick={() => handleMove(null)}
            className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-text-tertiary transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 3H3v18h18V3z" opacity="0.3" /><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="text-sm">移出当前周 (变为独立任务)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
