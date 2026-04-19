import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useHabitStore } from '../../stores/habit'
import { ProgressRing } from '../../components/ProgressRing'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

function getWeekStart(date: dayjs.Dayjs) {
  return date.isoWeekday(1) // Monday
}

export default function HabitPage() {
  const navigate = useNavigate()
  const { habits, records, toggleRecord, getStreak, isHabitScheduledForDate, getWeekCompletionRate } = useHabitStore()
  const todayStr = dayjs().format('YYYY-MM-DD')
  const activeHabits = habits.filter((h) => !h.archivedAt)

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, -1 = last week, etc.
  const [justChecked, setJustChecked] = useState<string | null>(null)

  const isToday = selectedDate === todayStr

  // Week dates based on offset
  const weekDates = useMemo(() => {
    const monday = getWeekStart(dayjs().add(weekOffset, 'week'))
    return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day').format('YYYY-MM-DD'))
  }, [weekOffset])

  const weekLabel = useMemo(() => {
    const monday = dayjs(weekDates[0])
    const month = monday.format('M月')
    // Find the week of the month
    const firstMonday = getWeekStart(monday.startOf('month'))
    const weekOfMonth = Math.ceil(monday.diff(firstMonday, 'day') / 7) + 1
    return `${month}第${weekOfMonth}周`
  }, [weekDates])

  // Records for the selected date
  const selectedDateRecordIds = useMemo(
    () => new Set(records.filter((r) => r.date === selectedDate).map((r) => r.habitId)),
    [records, selectedDate]
  )

  // Habits scheduled for the selected date
  const scheduledHabits = useMemo(
    () => activeHabits.filter((h) => isHabitScheduledForDate(h.id, selectedDate)),
    [activeHabits, selectedDate, isHabitScheduledForDate]
  )

  // Per-day completion data for the week timeline dots
  const weekDayStatus = useMemo(() => {
    return weekDates.map((date) => {
      const scheduled = activeHabits.filter((h) => isHabitScheduledForDate(h.id, date))
      const completed = scheduled.filter((h) =>
        records.some((r) => r.habitId === h.id && r.date === date)
      )
      const total = scheduled.length
      const done = completed.length
      return { date, total, done, ratio: total > 0 ? done / total : 0 }
    })
  }, [weekDates, activeHabits, records, isHabitScheduledForDate])

  const handleToggle = useCallback((habitId: string) => {
    if (!isToday) return
    const wasDone = selectedDateRecordIds.has(habitId)
    toggleRecord(habitId, todayStr)
    if (!wasDone) {
      setJustChecked(habitId)
      setTimeout(() => setJustChecked(null), 600)
    }
  }, [isToday, selectedDateRecordIds, toggleRecord, todayStr])

  // Progress for selected date
  const totalScheduled = scheduledHabits.length
  const completedCount = scheduledHabits.filter((h) => selectedDateRecordIds.has(h.id)).length
  const habitProgress = totalScheduled > 0 ? completedCount / totalScheduled : 0

  // Date label
  const dateLabel = useMemo(() => {
    if (selectedDate === todayStr) return '今日进度'
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    if (selectedDate === yesterday) return '昨日回顾'
    return dayjs(selectedDate).format('M月D日')
  }, [selectedDate, todayStr])

  // Monthly calendar
  const calendarMonth = useMemo(() => dayjs(selectedDate).startOf('month'), [selectedDate])

  const calendarDays = useMemo(() => {
    const start = calendarMonth
    const end = calendarMonth.endOf('month')
    const days: string[] = []
    let d = start
    while (d.isBefore(end) || d.isSame(end, 'day')) {
      days.push(d.format('YYYY-MM-DD'))
      d = d.add(1, 'day')
    }
    return days
  }, [calendarMonth])

  const dailyCounts = useMemo(() => {
    const counts: Record<string, { done: number; total: number }> = {}
    for (const date of calendarDays) {
      const scheduled = activeHabits.filter((h) => isHabitScheduledForDate(h.id, date))
      const done = scheduled.filter((h) =>
        records.some((r) => r.habitId === h.id && r.date === date)
      ).length
      counts[date] = { done, total: scheduled.length }
    }
    return counts
  }, [calendarDays, activeHabits, records, isHabitScheduledForDate])

  const startDayOfWeek = calendarMonth.day()
  const [showCalendar, setShowCalendar] = useState(false)

  return (
    <div className="p-5 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">习惯</h2>
        <button onClick={() => navigate('/habit/manage')} className="btn-primary">
          管理
        </button>
      </div>

      {/* Monthly calendar / heatmap */}
      <div className="card overflow-hidden mb-5">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full flex items-center justify-between px-5 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">📅</span>
            <span className="text-sm font-medium">
              {calendarMonth.format('YYYY年M月')} 打卡日历
            </span>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round"
            className={`text-text-tertiary transition-transform ${showCalendar ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {showCalendar && (
          <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-3 animate-fade-in">
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                <div key={d} className="text-text-tertiary py-1.5 text-[10px] font-medium">{d}</div>
              ))}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {calendarDays.map((date) => {
                const info = dailyCounts[date] || { done: 0, total: 0 }
                const isTodayDate = date === todayStr
                const isSelected = date === selectedDate
                const isFuture = dayjs(date).isAfter(dayjs(), 'day')
                const ratio = info.total > 0 ? info.done / info.total : 0
                return (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date)
                      const clickedMonday = getWeekStart(dayjs(date))
                      const currentMonday = getWeekStart(dayjs().add(weekOffset, 'week'))
                      if (!clickedMonday.isSame(currentMonday, 'day')) {
                        const diff = clickedMonday.diff(getWeekStart(dayjs()), 'week')
                        setWeekOffset(Math.min(diff, 0))
                      }
                    }}
                    className={`aspect-square flex items-center justify-center rounded-lg text-[11px] font-medium transition-all ${
                      isSelected ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-cream-dark' : ''
                    } ${
                      isTodayDate && !isSelected ? 'ring-1 ring-primary/30' : ''
                    } ${
                      isFuture
                        ? 'text-text-tertiary/40'
                        : ratio >= 1
                          ? 'bg-success text-white'
                          : ratio >= 0.5
                            ? 'bg-success/30 text-success'
                            : ratio > 0
                              ? 'bg-success/10 text-success/70'
                              : 'text-text-tertiary'
                    }`}
                  >
                    {dayjs(date).date()}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Week timeline */}
      <div className="card p-4 mb-5">
        {/* Week navigator */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-text-secondary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => { setWeekOffset(0); setSelectedDate(todayStr) }}
            className="text-sm font-semibold text-text-primary dark:text-text-primary-dark"
          >
            {weekLabel}
          </button>
          <button
            onClick={() => setWeekOffset((w) => Math.min(w + 1, 0))}
            disabled={weekOffset >= 0}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-text-secondary disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => {
            const d = dayjs(date)
            const isSelected = date === selectedDate
            const isTodayDate = date === todayStr
            const isFuture = d.isAfter(dayjs(), 'day')
            const status = weekDayStatus[i]

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center py-2 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : isTodayDate
                      ? 'bg-primary-soft'
                      : ''
                }`}
              >
                <span className={`text-[10px] font-medium mb-0.5 ${
                  isSelected ? 'text-white/80' : 'text-text-tertiary'
                }`}>
                  {dayLabels[i]}
                </span>
                <span className={`text-sm font-bold mb-1 ${
                  isSelected ? '' : isTodayDate ? 'text-primary' : isFuture ? 'text-text-tertiary/50' : ''
                }`}>
                  {d.date()}
                </span>
                {/* Completion indicator dot */}
                {!isFuture && status.total > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isSelected
                      ? status.ratio >= 1 ? 'bg-white' : status.ratio > 0 ? 'bg-white/50' : 'bg-white/20'
                      : status.ratio >= 1 ? 'bg-success' : status.ratio > 0 ? 'bg-success/40' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {activeHabits.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="text-5xl mb-4 animate-float">✅</div>
          <p className="text-text-secondary dark:text-text-secondary-dark font-medium">还没有习惯</p>
          <p className="text-sm text-text-tertiary mt-1">点击管理添加一个微习惯</p>
        </div>
      ) : (
        <>
          {/* Progress card */}
          <div className="card p-5 mb-5 flex items-center gap-5">
            <ProgressRing size={80} strokeWidth={7} progress={habitProgress} color="var(--color-primary)">
              <div className="text-center">
                <p className="text-xl font-bold">{Math.round(habitProgress * 100)}%</p>
                <p className="text-[10px] text-text-tertiary">完成率</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{dateLabel}</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                {isToday ? '已完成' : '完成了'} {completedCount}/{totalScheduled} 个习惯
              </p>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                  style={{ width: `${habitProgress * 100}%` }}
                />
              </div>
              {!isToday && (
                <p className="text-[10px] text-text-tertiary mt-1.5">
                  查看模式 · 仅今天可打卡
                </p>
              )}
            </div>
          </div>

          {/* Habit list */}
          {scheduledHabits.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-text-tertiary text-sm">这天没有需要打卡的习惯</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {scheduledHabits.map((habit) => {
                const done = selectedDateRecordIds.has(habit.id)
                const streak = getStreak(habit.id)
                const isPopping = justChecked === habit.id
                const weekRate = getWeekCompletionRate(habit.id)

                return (
                  <button
                    key={habit.id}
                    onClick={() => handleToggle(habit.id)}
                    disabled={!isToday}
                    className={`card w-full flex items-center gap-4 p-4 transition-all ${
                      done ? '!border-success/30 !bg-success-soft' : ''
                    } ${!isToday ? 'opacity-80' : ''}`}
                  >
                    <ProgressRing size={48} strokeWidth={4} progress={done ? 1 : 0} color={habit.color || 'var(--color-primary)'}>
                      <span className={`text-xl transition-transform ${isPopping ? 'animate-check-pop' : ''}`}>
                        {done ? '✓' : habit.icon}
                      </span>
                    </ProgressRing>

                    <div className="flex-1 text-left">
                      <p className={`font-medium text-sm ${done ? 'text-success' : ''}`}>
                        {habit.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {streak > 0 && (
                          <span className="text-[11px] text-warning font-medium">🔥 {streak}天</span>
                        )}
                        {weekRate > 0 && (
                          <span className="text-[11px] text-text-tertiary">本周 {weekRate}%</span>
                        )}
                        {isToday && !done && streak === 0 && (
                          <span className="text-[11px] text-text-tertiary">点击打卡</span>
                        )}
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      done
                        ? 'bg-success border-success text-white'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}>
                      {done && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
