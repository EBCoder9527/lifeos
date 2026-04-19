import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { usePlanStore } from '../../stores/plan'
import { ProgressRing } from '../../components/ProgressRing'
import { WeekTaskItem } from './components/WeekTaskItem'
import { AddTaskSheet } from './components/AddTaskSheet'
import { PlanBreadcrumb } from './components/PlanBreadcrumb'
import { TaskMoveSheet } from '../../components/TaskMoveSheet'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { getMondayOfWeek, getWeekDates } from '../../utils/week'

dayjs.extend(isoWeek)

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function getMotivation(progress: number): string {
  if (progress === 0) return '新的一周，新的起点'
  if (progress < 0.3) return '刚刚起步，继续加油'
  if (progress <= 0.6) return '稳步前进中...'
  if (progress < 0.9) return '太棒了，胜利在望!'
  if (progress < 1) return '最后冲刺!'
  return '完美的一周!'
}

export default function WeekPlanPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = usePlanStore()
  const [showAddTask, setShowAddTask] = useState(false)
  const [justDone, setJustDone] = useState<string | null>(null)
  const [showReflection, setShowReflection] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [moveTaskId, setMoveTaskId] = useState<string | null>(null)

  // Determine current week
  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')
  const currentMonday = getMondayOfWeek(today)

  // Find or derive the week plan
  const weekPlan = useMemo(() => {
    if (id) return store.weekPlans.find((w) => w.id === id)
    return store.weekPlans.find((w) => w.startDate === currentMonday.format('YYYY-MM-DD'))
  }, [id, store.weekPlans, currentMonday])

  const displayMonday = weekPlan ? dayjs(weekPlan.startDate) : currentMonday
  const displaySunday = displayMonday.add(6, 'day')
  const weekNumber = displayMonday.isoWeek()
  const weekDates = useMemo(() => getWeekDates(displayMonday.format('YYYY-MM-DD')), [displayMonday])

  // Tasks for this week
  const weekTasks = useMemo(() => {
    if (!weekPlan) return []
    return store.tasks.filter((t) => t.weekPlanId === weekPlan.id)
  }, [weekPlan, store.tasks])

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    const map: Record<string, typeof weekTasks> = {}
    for (const date of weekDates) map[date] = []
    const unscheduled: typeof weekTasks = []
    for (const t of weekTasks) {
      if (t.scheduledDate && map[t.scheduledDate]) {
        map[t.scheduledDate].push(t)
      } else {
        unscheduled.push(t)
      }
    }
    return { byDate: map, unscheduled }
  }, [weekTasks, weekDates])

  const totalTasks = weekTasks.length
  const doneTasks = weekTasks.filter((t) => t.done).length
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0

  // Ancestry for breadcrumb
  const ancestry = useMemo(() => {
    if (!weekPlan) return {}
    const mp = weekPlan.monthPlanId ? store.monthPlans.find((m) => m.id === weekPlan.monthPlanId) : undefined
    const qg = mp?.quarterGoalId ? store.quarterGoals.find((q) => q.id === mp.quarterGoalId) : undefined
    const yg = qg?.yearGoalId ? store.yearGoals.find((y) => y.id === qg.yearGoalId) : undefined
    return { yearGoal: yg, quarterGoal: qg, monthPlan: mp, weekPlan }
  }, [weekPlan, store.monthPlans, store.quarterGoals, store.yearGoals])

  // Week navigation
  const navigateWeek = useCallback((offset: number) => {
    const target = displayMonday.add(offset * 7, 'day')
    const targetStr = target.format('YYYY-MM-DD')
    const found = store.weekPlans.find((w) => w.startDate === targetStr)
    if (found) navigate(`/plan/week/${found.id}`)
    else navigate('/plan/week') // fallback to current
  }, [displayMonday, store.weekPlans, navigate])

  const goToday = useCallback(() => {
    const found = store.weekPlans.find((w) => w.startDate === currentMonday.format('YYYY-MM-DD'))
    if (found) navigate(`/plan/week/${found.id}`)
    else navigate('/plan/week')
  }, [store.weekPlans, currentMonday, navigate])

  const handleToggle = (taskId: string, isDone: boolean) => {
    store.toggleTask(taskId)
    if (!isDone) {
      setJustDone(taskId)
      setTimeout(() => setJustDone(null), 700)
    }
  }

  const handleDelete = (taskId: string) => {
    if (deleteId === taskId) {
      store.deleteTask(taskId)
      setDeleteId(null)
    } else {
      setDeleteId(taskId)
      setTimeout(() => setDeleteId(null), 3000)
    }
  }

  const handleAddTask = (data: { title: string; priority: 'high' | 'medium' | 'low'; scheduledDate?: string }) => {
    if (!weekPlan) {
      // Auto-create week plan
      const wpId = store.addWeekPlan({
        monthPlanId: null,
        year: displayMonday.year(),
        weekNumber,
        startDate: displayMonday.format('YYYY-MM-DD'),
        endDate: displaySunday.format('YYYY-MM-DD'),
        title: '',
      })
      store.addTask({ weekPlanId: wpId, ...data })
    } else {
      store.addTask({ weekPlanId: weekPlan.id, ...data })
    }
  }

  const handleReflectionChange = (text: string) => {
    if (weekPlan) {
      store.updateWeekPlan(weekPlan.id, { reflection: text })
    }
  }

  const isCurrentWeek = displayMonday.format('YYYY-MM-DD') === currentMonday.format('YYYY-MM-DD')

  return (
    <div className="p-5 pb-24 stagger-children">
      {/* Header: Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateWeek(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold">第{weekNumber}周</h2>
            <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark">
              {displayMonday.format('M/D')} - {displaySunday.format('M/D')}
            </p>
          </div>
          <button onClick={() => navigateWeek(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <button onClick={goToday} className="text-xs px-3 py-1.5 rounded-full bg-primary-soft text-primary font-medium">
              今
            </button>
          )}
          <button onClick={() => navigate('/plan/year')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Ancestry breadcrumb */}
      {(ancestry.yearGoal || ancestry.monthPlan) && (
        <div className="mb-4">
          <PlanBreadcrumb ancestry={ancestry} />
        </div>
      )}

      {/* Progress Hero Card */}
      <div className="card p-5 mb-5">
        <div className="flex items-center gap-5">
          <ProgressRing size={72} strokeWidth={6} progress={progress} color="var(--color-primary)">
            <div className="text-center">
              <p className="text-lg font-bold">{Math.round(progress * 100)}%</p>
            </div>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-sm font-medium mb-0.5">
              {doneTasks}/{totalTasks} 任务完成
            </p>
            {weekPlan?.title && (
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-1">
                本周主题: {weekPlan.title}
              </p>
            )}
            <p className={`text-xs font-medium ${progress >= 1 ? 'text-success' : 'text-primary'}`}>
              {getMotivation(progress)}
            </p>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-day task sections */}
      {weekPlan ? (
        <div className="space-y-3 mb-5">
          {weekDates.map((date, i) => {
            const tasks = tasksByDay.byDate[date]
            const isToday = date === todayStr
            const isPast = dayjs(date).isBefore(today, 'day')
            const allDone = tasks.length > 0 && tasks.every((t) => t.done)

            return (
              <div
                key={date}
                className={`card overflow-hidden transition-all ${
                  isToday
                    ? '!border-primary/30 ring-1 ring-primary/10'
                    : allDone && isPast
                      ? '!border-success/20 !bg-success-soft/30'
                      : ''
                }`}
              >
                {/* Day header */}
                <div className={`flex items-center justify-between px-4 py-2.5 ${
                  isToday ? 'bg-primary-soft/50' : ''
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isToday ? 'text-primary' : ''}`}>
                      {dayNames[i]}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {dayjs(date).format('M/D')}
                    </span>
                    {isToday && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-white font-medium">
                        今天
                      </span>
                    )}
                  </div>
                  {tasks.length > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      allDone
                        ? 'bg-success-soft text-success'
                        : 'bg-gray-100 dark:bg-gray-800 text-text-tertiary'
                    }`}>
                      {tasks.filter((t) => t.done).length}/{tasks.length}
                    </span>
                  )}
                </div>

                {/* Tasks */}
                {tasks.length > 0 ? (
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    {tasks
                      .sort((a, b) => {
                        const po = { high: 0, medium: 1, low: 2 }
                        if (a.done !== b.done) return a.done ? 1 : -1
                        return po[a.priority] - po[b.priority]
                      })
                      .map((task) => (
                        <WeekTaskItem
                          key={task.id}
                          id={task.id}
                          title={task.title}
                          done={task.done}
                          priority={task.priority}
                          justDone={justDone === task.id}
                          onToggle={() => handleToggle(task.id, task.done)}
                          onDelete={() => handleDelete(task.id)}
                          onMove={() => setMoveTaskId(task.id)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-text-tertiary">暂无任务</p>
                  </div>
                )}
              </div>
            )
          })}

          {/* Unscheduled tasks */}
          {tasksByDay.unscheduled.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm font-bold text-text-secondary dark:text-text-secondary-dark">未安排日期</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-text-tertiary font-medium">
                  {tasksByDay.unscheduled.length}
                </span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800">
                {tasksByDay.unscheduled.map((task) => (
                  <WeekTaskItem
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    done={task.done}
                    priority={task.priority}
                    justDone={justDone === task.id}
                    onToggle={() => handleToggle(task.id, task.done)}
                    onDelete={() => handleDelete(task.id)}
                    onMove={() => setMoveTaskId(task.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty state - no week plan */
        <div className="text-center py-16 animate-fade-in mb-5">
          <div className="text-5xl mb-4 animate-float">📋</div>
          <p className="text-text-secondary dark:text-text-secondary-dark font-medium">本周还没有计划</p>
          <p className="text-sm text-text-tertiary mt-1">点击下方按钮添加第一个任务</p>
        </div>
      )}

      {/* Weekly reflection */}
      {weekPlan && (
        <div className="card overflow-hidden mb-5">
          <button
            onClick={() => setShowReflection(!showReflection)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📝</span>
              <span className="text-sm font-medium">本周回顾</span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round"
              className={`text-text-tertiary transition-transform ${showReflection ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showReflection && (
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 animate-fade-in">
              <textarea
                value={weekPlan.reflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder="记录本周的收获和反思..."
                rows={3}
                className="input resize-none leading-relaxed text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* FAB: Add task */}
      <button
        onClick={() => setShowAddTask(true)}
        className="fixed right-5 bottom-24 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30 flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add task sheet */}
      <AddTaskSheet
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        onSubmit={handleAddTask}
        weekDates={weekDates}
      />

      {/* Task move sheet */}
      <TaskMoveSheet
        open={!!moveTaskId}
        onClose={() => setMoveTaskId(null)}
        taskId={moveTaskId || ''}
        currentWeekPlanId={weekPlan?.id || null}
      />
    </div>
  )
}
