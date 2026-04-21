import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { usePlanStore } from '../../stores/plan'
import { LayerIndicator } from './components/LayerIndicator'
import { PlanBreadcrumb } from './components/PlanBreadcrumb'
import { AddGoalSheet } from './components/AddGoalSheet'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

export default function MonthDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = usePlanStore()
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const monthPlan = store.monthPlans.find((m) => m.id === id)
  if (!monthPlan) return <div className="p-5 text-center text-text-tertiary">月计划不存在</div>

  const quarterGoal = monthPlan.quarterGoalId ? store.quarterGoals.find((q) => q.id === monthPlan.quarterGoalId) : undefined
  const yearGoal = quarterGoal ? store.yearGoals.find((y) => y.id === quarterGoal.yearGoalId) : undefined

  const weeks = useMemo(() =>
    store.getWeekPlans(monthPlan.id).sort((a, b) => a.weekNumber - b.weekNumber),
    [store, monthPlan.id]
  )
  const progress = store.getMonthProgress(monthPlan.id)

  const currentWeekNumber = dayjs().isoWeek()

  const openEdit = () => {
    setEditTitle(monthPlan.title)
    setEditDesc(monthPlan.description || '')
    setShowEdit(true)
  }

  const handleSaveEdit = () => {
    const t = editTitle.trim()
    if (!t) return
    store.updateMonthPlan(monthPlan.id, { title: t, description: editDesc.trim() || undefined })
    setShowEdit(false)
  }

  const handleDelete = () => {
    store.deleteMonthPlan(monthPlan.id)
    navigate(-1)
  }

  return (
    <div className="p-5 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <div className="flex items-center gap-2">
          <button onClick={openEdit} className="flex items-center gap-1 text-primary text-sm font-medium px-3 py-1.5 rounded-full bg-primary-soft">
            编辑
          </button>
          <LayerIndicator layer="strategy" />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-4">
        <PlanBreadcrumb ancestry={{ yearGoal, quarterGoal, monthPlan }} />
      </div>

      {/* Month info card - glassmorphism */}
      <div className="card p-5 mb-5 glass">
        <div className="flex items-center gap-2 mb-2">
          <span className="chip bg-warning-soft text-warning font-bold">{monthPlan.year}年{monthPlan.month}月</span>
        </div>
        <h2 className="text-lg font-bold mb-1">{monthPlan.title}</h2>
        {monthPlan.description && (
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed mb-3">{monthPlan.description}</p>
        )}

        {/* Horizontal progress bar (execution layer uses bars, not rings) */}
        <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-secondary-dark mb-2">
          <span>{weeks.length} 个周计划</span>
          <span className="font-bold text-primary">{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-warning to-success rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Week plans - timeline layout */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs font-semibold text-text-tertiary">周计划时间线</p>
        <button onClick={() => setShowAdd(true)} className="text-xs text-primary font-medium">+ 添加</button>
      </div>

      {weeks.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-text-tertiary">还没有周计划</p>
          <p className="text-xs text-text-tertiary mt-1">创建周计划开始执行</p>
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Timeline vertical line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20 rounded-full" />

          <div className="space-y-3">
            {weeks.map((week) => {
              const wProgress = store.getWeekProgress(week.id)
              const taskCount = store.getWeekTasks(week.id).length
              const doneCount = store.getWeekTasks(week.id).filter((t) => t.done).length
              const isCurrent = week.weekNumber === currentWeekNumber && week.year === dayjs().year()

              return (
                <div key={week.id} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 top-4 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center z-10 ${
                    isCurrent
                      ? 'bg-primary border-primary shadow-md shadow-primary/30'
                      : wProgress >= 1
                        ? 'bg-success border-success'
                        : 'bg-surface dark:bg-surface-dark border-gray-200 dark:border-gray-600'
                  }`}>
                    {(isCurrent || wProgress >= 1) && (
                      <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-white'}`} />
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/plan/week/${week.id}`)}
                    className={`card w-full text-left p-4 transition-all ${
                      isCurrent ? '!border-primary/30 ring-1 ring-primary/10 shadow-md shadow-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-primary' : 'text-text-secondary dark:text-text-secondary-dark'}`}>
                          第{week.weekNumber}周
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {dayjs(week.startDate).format('M/D')} - {dayjs(week.endDate).format('M/D')}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-white font-medium">本周</span>
                        )}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>

                    {week.title && (
                      <p className="text-sm font-medium mb-2">{week.title}</p>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            wProgress >= 1
                              ? 'bg-success'
                              : 'bg-gradient-to-r from-primary to-primary-light'
                          }`}
                          style={{ width: `${wProgress * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-tertiary shrink-0">
                        {taskCount > 0 ? `${doneCount}/${taskCount}` : '无任务'}
                      </span>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <AddGoalSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        mode="week"
        onSubmitWeek={(data) => {
          // Auto-compute next week number
          const nextWeek = weeks.length > 0
            ? Math.max(...weeks.map((w) => w.weekNumber)) + 1
            : dayjs().isoWeek()
          const monday = dayjs().isoWeek(nextWeek).isoWeekday(1)
          const sunday = monday.add(6, 'day')
          store.addWeekPlan({
            monthPlanId: monthPlan.id,
            year: monthPlan.year,
            weekNumber: nextWeek,
            startDate: monday.format('YYYY-MM-DD'),
            endDate: sunday.format('YYYY-MM-DD'),
            title: data.title,
          })
        }}
      />

      {/* Edit sheet */}
      {showEdit && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="w-full max-w-lg bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">编辑月计划</h3>
              <button onClick={() => setShowEdit(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="月计划标题" className="input mb-3" autoFocus />
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="描述（可选）" rows={3} className="input resize-none mb-4" />
            <button onClick={handleSaveEdit} disabled={!editTitle.trim()} className="btn-primary w-full !py-3">保存</button>
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="mt-6">
        {showDelete ? (
          <div className="card p-4 border-danger/20 animate-scale-in">
            <p className="text-sm text-danger mb-3 font-medium">确定要删除这个月计划吗？</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 bg-danger text-white rounded-xl py-2.5 text-sm font-medium">确认删除</button>
              <button onClick={() => setShowDelete(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 text-sm font-medium">取消</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDelete(true)} className="w-full text-danger/60 text-sm py-2 hover:text-danger transition-colors">
            删除这个月计划
          </button>
        )}
      </div>
    </div>
  )
}
