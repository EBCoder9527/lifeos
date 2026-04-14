import { useHabitStore } from '../../stores/habit'
import dayjs from 'dayjs'

export default function HabitPage() {
  const { habits, records, toggleRecord, getStreak } = useHabitStore()
  const today = dayjs().format('YYYY-MM-DD')
  const activeHabits = habits.filter((h) => !h.archivedAt)
  const todayRecordIds = new Set(
    records.filter((r) => r.date === today).map((r) => r.habitId)
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">今日习惯</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {dayjs().format('M月D日')}
        </span>
      </div>

      {activeHabits.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-600 py-20">
          <p className="text-4xl mb-3">✅</p>
          <p>还没有习惯</p>
          <p className="text-sm mt-1">添加一个微习惯开始打卡</p>
        </div>
      ) : (
        <div className="space-y-3">
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
      )}
    </div>
  )
}
