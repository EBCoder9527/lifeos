import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useHabitStore } from '../../stores/habit'
import dayjs from 'dayjs'

export default function HabitPage() {
  const navigate = useNavigate()
  const { habits, records, toggleRecord, getStreak } = useHabitStore()
  const today = dayjs().format('YYYY-MM-DD')
  const activeHabits = habits.filter((h) => !h.archivedAt)
  const todayRecordIds = new Set(
    records.filter((r) => r.date === today).map((r) => r.habitId)
  )

  // 当月日历数据
  const calendarDays = useMemo(() => {
    const start = dayjs().startOf('month')
    const end = dayjs().endOf('month')
    const days: string[] = []
    let d = start
    while (d.isBefore(end) || d.isSame(end, 'day')) {
      days.push(d.format('YYYY-MM-DD'))
      d = d.add(1, 'day')
    }
    return days
  }, [])

  // 每天完成的习惯数
  const dailyCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of records) {
      counts[r.date] = (counts[r.date] || 0) + 1
    }
    return counts
  }, [records])

  const totalActive = activeHabits.length
  const startDayOfWeek = dayjs(calendarDays[0]).day()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">今日习惯</h2>
        <button
          onClick={() => navigate('/habit/manage')}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full font-medium"
        >
          + 管理
        </button>
      </div>

      {activeHabits.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-600 py-20">
          <p className="text-4xl mb-3">✅</p>
          <p>还没有习惯</p>
          <p className="text-sm mt-1">点击右上角添加一个微习惯</p>
        </div>
      ) : (
        <>
          {/* 打卡列表 */}
          <div className="space-y-3 mb-6">
            {activeHabits.map((habit) => {
              const done = todayRecordIds.has(habit.id)
              const streak = getStreak(habit.id)
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleRecord(habit.id, today)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl shadow-sm transition-all ${
                    done
                      ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-400'
                      : 'bg-white dark:bg-gray-800 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl">{habit.icon}</span>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${done ? 'line-through text-gray-400' : ''}`}>
                      {habit.name}
                    </p>
                    {streak > 0 && (
                      <p className="text-xs text-orange-500">
                        🔥 连续 {streak} 天
                      </p>
                    )}
                  </div>
                  <span className="text-2xl">{done ? '✅' : '⬜'}</span>
                </button>
              )
            })}
          </div>

          {/* 月度日历 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-medium mb-3">
              {dayjs().format('YYYY年M月')} 打卡日历
            </p>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                <div key={d} className="text-gray-400 dark:text-gray-500 py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {calendarDays.map((date) => {
                const count = dailyCounts[date] || 0
                const isToday = date === today
                const ratio = totalActive > 0 ? count / totalActive : 0
                return (
                  <div
                    key={date}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs ${
                      isToday ? 'ring-2 ring-blue-400' : ''
                    } ${
                      ratio >= 1
                        ? 'bg-green-500 text-white'
                        : ratio > 0
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {dayjs(date).date()}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
