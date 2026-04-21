import { useState, useRef, useMemo } from 'react'
import { useLocation } from 'react-router'
import { usePlanStore } from '../stores/plan'
import { getCurrentWeekInfo } from '../utils/week'
import type { Priority } from '../types'
import dayjs from 'dayjs'

const priorities: { value: Priority; label: string; dot: string; color: string }[] = [
  { value: 'high', label: '高', dot: 'bg-danger', color: 'bg-danger/10 text-danger' },
  { value: 'medium', label: '中', dot: 'bg-warning', color: 'bg-warning/10 text-warning' },
  { value: 'low', label: '低', dot: 'bg-accent', color: 'bg-accent/10 text-accent' },
]

const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

export function QuickAdd() {
  const location = useLocation()
  const store = usePlanStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showGoals, setShowGoals] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Only show on plan hierarchy pages (not week plan — it has its own FAB)
  const shouldShow = location.pathname.startsWith('/plan') && !location.pathname.startsWith('/plan/week')
  const shouldHide = !shouldShow

  const weekInfo = useMemo(() => getCurrentWeekInfo(), [])
  const todayIndex = useMemo(() => {
    const todayStr = dayjs().format('YYYY-MM-DD')
    return weekInfo.weekDates.findIndex((d) => d === todayStr)
  }, [weekInfo])

  // Available goals for optional assignment
  const goalOptions = useMemo(() => {
    const now = dayjs()
    const currentYear = now.year()
    const currentQuarter = Math.ceil((now.month() + 1) / 3) as 1 | 2 | 3 | 4
    const currentMonth = now.month() + 1

    const items: { id: string; type: 'year' | 'quarter' | 'month'; label: string; emoji: string }[] = []

    store.yearGoals
      .filter((g) => g.status === 'active' && g.year === currentYear)
      .forEach((g) => {
        items.push({ id: g.id, type: 'year', label: `${g.title} (${g.year})`, emoji: '🎯' })
      })

    store.quarterGoals
      .filter((q) => q.status === 'active' && q.year === currentYear && q.quarter === currentQuarter)
      .forEach((q) => {
        items.push({ id: q.id, type: 'quarter', label: `Q${q.quarter}: ${q.title}`, emoji: '📚' })
      })

    store.monthPlans
      .filter((m) => m.status === 'active' && m.year === currentYear && m.month === currentMonth)
      .forEach((m) => {
        items.push({ id: m.id, type: 'month', label: `${m.month}月: ${m.title}`, emoji: '📅' })
      })

    return items.slice(0, 10)
  }, [store.yearGoals, store.quarterGoals, store.monthPlans])

  if (shouldHide) return null

  const handleOpen = () => {
    setOpen(true)
    setSelectedDay(todayIndex >= 0 ? todayIndex : null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleClose = () => {
    setOpen(false)
    setTitle('')
    setPriority('medium')
    setSelectedDay(null)
    setShowGoals(false)
    setSelectedGoalId(null)
  }

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) return

    const weekPlan = store.getOrCreateCurrentWeekPlan()

    // If a month plan is selected, link the week plan to it (if not already linked)
    if (selectedGoalId) {
      const goalOption = goalOptions.find((g) => g.id === selectedGoalId)
      if (goalOption?.type === 'month' && !weekPlan.monthPlanId) {
        store.updateWeekPlan(weekPlan.id, { monthPlanId: selectedGoalId })
      }
    }

    store.addTask({
      weekPlanId: weekPlan.id,
      title: trimmed,
      priority,
      scheduledDate: selectedDay !== null ? weekInfo.weekDates[selectedDay] : undefined,
    })

    setTitle('')
    setPriority('medium')
    inputRef.current?.focus()
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={handleOpen}
        className="fixed right-5 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
        style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Sheet overlay */}
      {open && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="w-full max-w-lg bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">快速添加</h3>
              <button
                onClick={handleClose}
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
            <div className="mb-3">
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">安排日期</p>
              <div className="flex gap-1.5">
                {dayLabels.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(selectedDay === i ? null : i)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedDay === i
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : i === todayIndex
                          ? 'bg-primary-soft text-primary'
                          : 'bg-gray-50 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal assignment (optional, collapsible) */}
            {goalOptions.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowGoals(!showGoals)}
                  className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2"
                >
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round"
                    className={`transition-transform ${showGoals ? 'rotate-90' : ''}`}
                  >
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                  归属到目标 (可选)
                </button>
                {showGoals && (
                  <div className="space-y-1.5 animate-fade-in">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setSelectedGoalId(selectedGoalId === goal.id ? null : goal.id)}
                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          selectedGoalId === goal.id
                            ? 'bg-primary-soft text-primary ring-1 ring-primary/20'
                            : 'bg-gray-50 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
                        }`}
                      >
                        <span>{goal.emoji}</span>
                        <span className="truncate">{goal.label}</span>
                        {selectedGoalId === goal.id && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
      )}
    </>
  )
}
