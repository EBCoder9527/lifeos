import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { usePlanStore } from '../../stores/plan'
import { ProgressRing } from '../../components/ProgressRing'
import { WeekTaskItem } from './components/WeekTaskItem'
import { AddTaskSheet } from './components/AddTaskSheet'
import { PlanBreadcrumb } from './components/PlanBreadcrumb'
import { useMessage } from '../../hooks/useMessage' // fix: unified showMessage
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
  const [deleteId, setDeleteId] = useState<string | null>(null) // fix: confirmation dialog
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set()) // fix: collapsible day cards
  const [showEditWeek, setShowEditWeek] = useState(false)
  const [showDeleteWeek, setShowDeleteWeek] = useState(false)
  const [editWeekTitle, setEditWeekTitle] = useState('')
  const { showMessage } = useMessage() // fix: unified showMessage

  // Determine current week
  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')
  const currentMonday = getMondayOfWeek(today)

  // Find or derive the week plan
  // fix: support multiple week plans for the same date (goal-layer vs standalone)
  const allWeekPlansForDate = useMemo(() => {
    if (id) {
      // When viewing a specific plan by ID, also find others for the same date
      const target = store.weekPlans.find((w) => w.id === id)
      if (!target) return []
      return store.weekPlans.filter((w) => w.startDate === target.startDate)
    }
    const mondayStr = currentMonday.format('YYYY-MM-DD')
    return store.weekPlans.filter((w) => w.startDate === mondayStr)
  }, [id, store.weekPlans, currentMonday])

  const weekPlan = useMemo(() => {
    if (id) return allWeekPlansForDate.find((w) => w.id === id)
    // Default: prefer standalone (monthPlanId === null) plan
    return allWeekPlansForDate.find((w) => !w.monthPlanId) ?? allWeekPlansForDate[0]
  }, [id, allWeekPlansForDate])

  const isGoalWeekPlan = weekPlan?.monthPlanId != null // fix: distinguish goal-layer

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
      showToast('任务已完成')
    }
  }

  // fix: delete with confirmation dialog
  const handleDelete = (taskId: string) => {
    setDeleteId(taskId)
  }

  const confirmDelete = () => {
    if (deleteId) {
      store.deleteTask(deleteId)
      showToast('任务已删除')
      setDeleteId(null)
    }
  }

  // fix: toggle day card collapse
  const toggleDayCollapse = (date: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  // fix: replaced local showToast with unified showMessage
  const showToast = (msg: string) => showMessage('success', msg)

  const handleAddTask = (data: { title: string; priority: 'high' | 'medium' | 'low'; scheduledDates: string[] }) => {
    let wpId = weekPlan?.id
    if (!wpId) {
      // Auto-create week plan
      wpId = store.addWeekPlan({
        monthPlanId: null,
        year: displayMonday.year(),
        weekNumber,
        startDate: displayMonday.format('YYYY-MM-DD'),
        endDate: displaySunday.format('YYYY-MM-DD'),
        title: '',
      })
    }
    if (data.scheduledDates.length === 0) {
      // No date selected — create one unscheduled task
      store.addTask({ weekPlanId: wpId, title: data.title, priority: data.priority })
    } else {
      // Create one task per selected date (backward compatible — each task has single scheduledDate)
      for (const date of data.scheduledDates) {
        store.addTask({ weekPlanId: wpId, title: data.title, priority: data.priority, scheduledDate: date })
      }
    }
    setShowAddTask(false)
    showToast(data.scheduledDates.length > 1 ? `已添加 ${data.scheduledDates.length} 个任务` : '任务添加成功')
  }

  const handleReflectionChange = (text: string) => {
    if (weekPlan) {
      store.updateWeekPlan(weekPlan.id, { reflection: text })
    }
  }

  const openEditWeek = () => {
    if (weekPlan) {
      setEditWeekTitle(weekPlan.title || '')
      setShowEditWeek(true)
    }
  }

  const handleSaveWeekEdit = () => {
    if (weekPlan) {
      store.updateWeekPlan(weekPlan.id, { title: editWeekTitle.trim() })
      setShowEditWeek(false)
      showToast('周计划已更新')
    }
  }

  const handleDeleteWeek = () => {
    if (weekPlan) {
      store.deleteWeekPlan(weekPlan.id)
      navigate('/plan', { replace: true })
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
          {weekPlan && (
            <button onClick={openEditWeek} className="text-xs px-3 py-1.5 rounded-full bg-primary-soft text-primary font-medium">
              编辑
            </button>
          )}
          <button onClick={() => navigate('/plan/year')} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary text-xs font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            目标
          </button>
        </div>
      </div>

      {/* Ancestry breadcrumb */}
      {(ancestry.yearGoal || ancestry.monthPlan) && (
        <div className="mb-4">
          <PlanBreadcrumb ancestry={ancestry} />
        </div>
      )}

      {/* fix: Week plan switcher — show when multiple plans exist for the same date */}
      {allWeekPlansForDate.length > 1 && (
        <div className="flex gap-2 mb-4">
          {allWeekPlansForDate.map((wp) => {
            const isGoal = wp.monthPlanId != null
            const isActive = wp.id === weekPlan?.id
            return (
              <button
                key={wp.id}
                onClick={() => navigate(`/plan/week/${wp.id}`)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                  isActive
                    ? isGoal
                      ? 'bg-secondary-soft text-secondary border-secondary/30'
                      : 'bg-primary-soft text-primary border-primary/30'
                    : 'border-transparent bg-gray-50 dark:bg-gray-800 text-text-secondary'
                }`}
              >
                <span>{isGoal ? '🎯' : '📋'}</span>
                {isGoal ? '目标计划' : '日常计划'}
              </button>
            )
          })}
        </div>
      )}

      {/* fix: Goal-layer visual badge */}
      {isGoalWeekPlan && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-soft text-secondary font-medium">
            🎯 目标层计划
          </span>
        </div>
      )}

      {/* Progress Hero Card */}
      <div className={`card p-5 mb-5 ${isGoalWeekPlan ? '!border-secondary/20 ring-1 ring-secondary/10' : ''}`}>
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
              <p className="text-base font-extrabold text-primary mb-1">{/* fix: bigger/bolder for 本周主题 */}
                {weekPlan.title}
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
            const isCollapsed = collapsedDays.has(date) // fix: collapsible

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
                {/* fix: Day header — clickable to toggle collapse */}
                <button
                  onClick={() => toggleDayCollapse(date)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 ${
                    isToday ? 'bg-primary-soft/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round"
                      className={`text-text-tertiary transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                    >
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
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
                </button>

                {/* fix: Tasks — hide when collapsed */}
                {!isCollapsed && (
                  tasks.length > 0 ? (
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
                            scheduledDate={task.scheduledDate}
                            weekDates={weekDates}
                            justDone={justDone === task.id}
                            onToggle={() => handleToggle(task.id, task.done)}
                            onDelete={() => handleDelete(task.id)}
                            onEdit={(data) => {
                              store.updateTask(task.id, data)
                              showToast('任务已更新')
                            }}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-text-tertiary">暂无任务</p>
                    </div>
                  )
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
                    scheduledDate={task.scheduledDate}
                    weekDates={weekDates}
                    justDone={justDone === task.id}
                    onToggle={() => handleToggle(task.id, task.done)}
                    onDelete={() => handleDelete(task.id)}
                    onEdit={(data) => {
                      store.updateTask(task.id, data)
                      showToast('任务已更新')
                    }}
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
        className="fixed right-5 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30 flex items-center justify-center z-30 active:scale-95 transition-transform"
        style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
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

      {/* Edit week sheet */}
      {showEditWeek && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowEditWeek(false)}>
          <div className="w-full max-w-lg bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">编辑周计划</h3>
              <button onClick={() => setShowEditWeek(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <input value={editWeekTitle} onChange={(e) => setEditWeekTitle(e.target.value)} placeholder="本周主题（可选）" className="input mb-4" autoFocus />
            <button onClick={handleSaveWeekEdit} className="btn-primary w-full !py-3">保存</button>
            <div className="mt-4">
              {showDeleteWeek ? (
                <div className="card p-4 border-danger/20 animate-scale-in">
                  <p className="text-sm text-danger mb-3 font-medium">确定要删除这个周计划吗？所有任务也会被删除。</p>
                  <div className="flex gap-2">
                    <button onClick={handleDeleteWeek} className="flex-1 bg-danger text-white rounded-xl py-2.5 text-sm font-medium">确认删除</button>
                    <button onClick={() => setShowDeleteWeek(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 text-sm font-medium">取消</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowDeleteWeek(true)} className="w-full text-danger/60 text-sm py-2 hover:text-danger transition-colors">
                  删除这个周计划
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* fix: delete task confirmation dialog */}
      {deleteId && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="w-full max-w-sm bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up">
            <p className="text-sm text-danger mb-4 font-medium text-center">确定要删除这个任务吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 text-sm font-medium">
                取消
              </button>
              <button onClick={confirmDelete} className="flex-1 bg-danger text-white rounded-xl py-2.5 text-sm font-medium">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* fix: toast now handled by global MessageProvider */}
    </div>
  )
}
