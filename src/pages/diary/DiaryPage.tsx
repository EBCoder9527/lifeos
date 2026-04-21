import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useDiaryStore } from '../../stores/diary'
import { stripHtml } from '../../utils/html'
import dayjs from 'dayjs'

const moodEmoji: Record<string, string> = {
  happy: '😊', calm: '😌', sad: '😢', angry: '😤', tired: '😴',
}

const moodColor: Record<string, string> = {
  happy: 'bg-warning-soft text-warning',
  calm: 'bg-accent-soft text-accent',
  sad: 'bg-primary-soft text-primary',
  angry: 'bg-secondary-soft text-secondary',
  tired: 'bg-gray-100 dark:bg-gray-800 text-text-secondary',
}

const moodBarColor: Record<string, string> = {
  happy: 'bg-warning',
  calm: 'bg-accent',
  sad: 'bg-primary',
  angry: 'bg-secondary',
  tired: 'bg-gray-300 dark:bg-gray-600',
}

export default function DiaryPage() {
  const { diaries } = useDiaryStore()
  const navigate = useNavigate()

  // Available months from diary data
  const availableMonths = useMemo(() => {
    const months = new Set(diaries.map((d) => dayjs(d.date).format('YYYY-MM')))
    return Array.from(months).sort().reverse()
  }, [diaries])

  const currentMonth = dayjs().format('YYYY-MM')
  const hasCurrentMonth = availableMonths.includes(currentMonth)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(
    hasCurrentMonth ? currentMonth : null
  )

  // Filtered diaries
  const filteredDiaries = useMemo(() => {
    if (!selectedMonth) return diaries
    return diaries.filter((d) => dayjs(d.date).format('YYYY-MM') === selectedMonth)
  }, [diaries, selectedMonth])

  // Group by month
  const grouped = useMemo(() => {
    return filteredDiaries.reduce<Record<string, typeof filteredDiaries>>((acc, d) => {
      const key = dayjs(d.date).format('YYYY年M月')
      ;(acc[key] ??= []).push(d)
      return acc
    }, {})
  }, [filteredDiaries])

  // Stats for the selected month (or current month if "all")
  const statsMonth = selectedMonth ?? currentMonth
  const monthDiaries = useMemo(
    () => diaries.filter((d) => dayjs(d.date).format('YYYY-MM') === statsMonth),
    [diaries, statsMonth]
  )
  const daysInMonth = dayjs(statsMonth).daysInMonth()
  const daysRecorded = monthDiaries.length
  const recordPercent = daysInMonth > 0 ? Math.round((daysRecorded / daysInMonth) * 100) : 0

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of monthDiaries) {
      counts[d.mood] = (counts[d.mood] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [monthDiaries])

  const [showStats, setShowStats] = useState(true)

  return (
    <div className="p-5 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">日记</h2>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
            共 {diaries.length} 篇记录
          </p>
        </div>
        <button
          onClick={() => navigate('/diary/new')}
          className="btn-primary"
        >
          写日记
        </button>
      </div>

      {/* Month selector */}
      {availableMonths.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedMonth(null)}
            className={`chip shrink-0 transition-all ${
              !selectedMonth
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
            }`}
          >
            全部
          </button>
          {availableMonths.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(selectedMonth === m ? null : m)}
              className={`chip shrink-0 transition-all ${
                selectedMonth === m
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
              }`}
            >
              {dayjs(m).format('M月')}
            </button>
          ))}
        </div>
      )}

      {/* Monthly stats card */}
      {monthDiaries.length > 0 && (
        <div className="card overflow-hidden mb-5">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📊</span>
              <span className="text-sm font-medium">
                {dayjs(statsMonth).format('M月')}统计
              </span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round"
              className={`text-text-tertiary transition-transform ${showStats ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showStats && (
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 animate-fade-in">
              {/* Days recorded */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                    记录 {daysRecorded}/{daysInMonth} 天
                  </span>
                  <span className="text-xs font-medium text-primary">{recordPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                    style={{ width: `${recordPercent}%` }}
                  />
                </div>
              </div>
              {/* Mood distribution */}
              {moodCounts.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  {moodCounts.map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-1">
                      <span className="text-base">{moodEmoji[mood]}</span>
                      <span className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">{count}</span>
                      <div className="w-8 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${moodBarColor[mood]} rounded-full`}
                          style={{ width: `${(count / daysRecorded) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Diary list */}
      {diaries.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="text-5xl mb-4 animate-float">📔</div>
          <p className="text-text-secondary dark:text-text-secondary-dark font-medium">还没有日记</p>
          <p className="text-sm text-text-tertiary mt-1">记录今天的心情和故事吧</p>
        </div>
      ) : filteredDiaries.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <p className="text-text-tertiary text-sm">这个月还没有日记</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, entries]) => (
            <div key={month}>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-1">{month}</p>
              <div className="space-y-3">
                {entries.map((diary) => (
                  <button
                    key={diary.id}
                    onClick={() => navigate(`/diary/${diary.id}`)}
                    className="card w-full text-left p-4 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 text-center">
                        <p className="text-lg font-bold text-text-primary dark:text-text-primary-dark leading-none">
                          {dayjs(diary.date).format('D')}
                        </p>
                        <p className="text-[10px] text-text-tertiary mt-0.5">
                          {dayjs(diary.date).format('ddd')}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed line-clamp-1 whitespace-pre-wrap mb-1.5">
                          {stripHtml(diary.content)}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`chip ${moodColor[diary.mood]}`}>
                            {moodEmoji[diary.mood]}
                          </span>
                          {diary.tags?.slice(0, 3).map((tag) => (
                            <span key={tag} className="chip bg-primary-soft text-primary">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
