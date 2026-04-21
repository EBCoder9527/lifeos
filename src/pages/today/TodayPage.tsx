import dayjs from 'dayjs'
import { useNavigate } from 'react-router'
import { useDiaryStore } from '../../stores/diary'
import { useHabitStore } from '../../stores/habit'
import { usePlanStore } from '../../stores/plan'
import { useIdeaStore } from '../../stores/idea'
import { ProgressRing } from '../../components/ProgressRing'
import { stripHtml } from '../../utils/html'

const moodEmoji: Record<string, string> = {
  happy: '😊', calm: '😌', sad: '😢', angry: '😤', tired: '😴',
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，早点休息'
  if (h < 9) return '早上好，新的一天'
  if (h < 12) return '上午好，保持专注'
  if (h < 14) return '中午好，记得休息'
  if (h < 18) return '下午好，继续加油'
  if (h < 21) return '晚上好，放松一下'
  return '夜深了，辛苦了'
}

function getMotivation(): string {
  const quotes = [
    '每一步，都算数',
    '慢慢来，比较快',
    '今天也是值得记录的一天',
    '坚持本身就是一种力量',
    '做自己生活的设计师',
    '小小的进步，大大的改变',
  ]
  const day = dayjs().diff(dayjs().startOf('year'), 'day') + 1
  return quotes[day % quotes.length]
}

export default function TodayPage() {
  const navigate = useNavigate()
  const { diaries } = useDiaryStore()
  const { habits, records, getStreak } = useHabitStore()
  const planStore = usePlanStore()
  const { ideas } = useIdeaStore()

  const today = dayjs().format('YYYY-MM-DD')
  const activeHabits = habits.filter((h) => !h.archivedAt)
  const todayRecords = records.filter((r) => r.date === today)
  const todayDiary = diaries.find((d) => d.date === today)
  const currentWeek = planStore.getCurrentWeekPlan()
  const weekTasks = currentWeek ? planStore.getWeekTasks(currentWeek.id) : []
  const activeTasks = weekTasks.filter((t) => !t.done)
  const doneTodayCount = weekTasks.filter((t) => t.done && t.doneAt && dayjs(t.doneAt).format('YYYY-MM-DD') === today).length
  const weekProgress = currentWeek ? planStore.getWeekProgress(currentWeek.id) : 0

  const habitProgress = activeHabits.length > 0 ? todayRecords.length / activeHabits.length : 0

  return (
    <div className="p-5 stagger-children">
      {/* ── 问候区 ── */}
      <div className="mb-6">
        <p className="text-text-secondary dark:text-text-secondary-dark text-sm mb-1">
          {dayjs().format('YYYY年M月D日 dddd')}
        </p>
        <h2 className="text-2xl font-bold mb-1">{getGreeting()}</h2>
        <p className="text-sm text-text-tertiary italic">"{getMotivation()}"</p>
      </div>

      {/* ── 今日心情 ── */}
      <div
        className="card p-5 mb-4 cursor-pointer"
        onClick={() => todayDiary ? navigate(`/diary/${todayDiary.id}`) : navigate('/diary/new')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-1">今日心情</p>
            {todayDiary ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-float">{moodEmoji[todayDiary.mood]}</span>
                <div>
                  <p className="text-sm font-medium">已记录</p>
                  <p className="text-xs text-text-tertiary line-clamp-1 max-w-[180px]">{stripHtml(todayDiary.content)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-3xl opacity-30">📝</span>
                <p className="text-sm text-text-tertiary">点击记录今天的心情</p>
              </div>
            )}
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* ── 习惯进度 ── */}
      <div className="card p-5 mb-4 cursor-pointer" onClick={() => navigate('/habit')}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium">今日习惯</p>
          <span className="text-xs text-primary font-medium">{todayRecords.length}/{activeHabits.length} 已完成</span>
        </div>
        {activeHabits.length === 0 ? (
          <p className="text-sm text-text-tertiary">还没有添加习惯</p>
        ) : (
          <div className="flex items-center gap-5">
            <ProgressRing size={72} strokeWidth={6} progress={habitProgress} color="var(--color-primary)">
              <span className="text-lg font-bold">{Math.round(habitProgress * 100)}%</span>
            </ProgressRing>
            <div className="flex-1 flex flex-wrap gap-2">
              {activeHabits.slice(0, 6).map((h) => {
                const done = todayRecords.some((r) => r.habitId === h.id)
                const streak = getStreak(h.id)
                return (
                  <div
                    key={h.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      done
                        ? 'bg-success-soft text-success'
                        : 'bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
                    }`}
                  >
                    <span>{h.icon}</span>
                    <span>{done ? `${streak}天` : h.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 本周计划 ── */}
      <div className="card p-5 mb-4 cursor-pointer" onClick={() => navigate('/plan')}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium">本周计划</p>
          <span className="text-xs text-primary font-medium">
            {currentWeek ? `${activeTasks.length} 项待办` : '未创建'}
          </span>
        </div>
        {!currentWeek ? (
          <p className="text-sm text-text-tertiary">点击创建本周计划</p>
        ) : activeTasks.length === 0 && doneTodayCount === 0 ? (
          <p className="text-sm text-text-tertiary">暂无任务安排</p>
        ) : (
          <div className="space-y-2">
            {doneTodayCount > 0 && (
              <p className="text-xs text-success font-medium">今日已完成 {doneTodayCount} 项</p>
            )}
            {activeTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  task.priority === 'high' ? 'bg-danger' : task.priority === 'medium' ? 'bg-warning' : 'bg-accent'
                }`} />
                <p className="text-sm truncate">{task.title}</p>
              </div>
            ))}
            {activeTasks.length > 3 && (
              <p className="text-xs text-text-tertiary">还有 {activeTasks.length - 3} 项...</p>
            )}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                  style={{ width: `${weekProgress * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-text-tertiary font-medium">{Math.round(weekProgress * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 最近灵感 ── */}
      {ideas.length > 0 && (
        <div className="card p-5 cursor-pointer" onClick={() => navigate('/idea')}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium">最近灵感</p>
            <span className="text-xs text-primary font-medium">{ideas.length} 条</span>
          </div>
          <p className="text-sm line-clamp-2 text-text-secondary dark:text-text-secondary-dark">
            {stripHtml(ideas[0].content)}
          </p>
          {(ideas[0].tags?.length ?? 0) > 0 && (
            <div className="flex gap-1.5 mt-2">
              {ideas[0].tags.slice(0, 3).map((tag) => (
                <span key={tag} className="chip bg-primary-soft text-primary">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
