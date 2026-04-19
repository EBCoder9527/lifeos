import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { usePlanStore } from '../../stores/plan'
import { ProgressRing } from '../../components/ProgressRing'
import { LayerIndicator, categoryConfig } from './components/LayerIndicator'
import { AddGoalSheet } from './components/AddGoalSheet'

export default function YearGoalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = usePlanStore()
  const [showAdd, setShowAdd] = useState(false)

  const goal = store.yearGoals.find((g) => g.id === id)
  if (!goal) return <div className="p-5 text-center text-text-tertiary">目标不存在</div>

  const cfg = categoryConfig[goal.category]
  const quarters = useMemo(() => store.getQuarterGoals(goal.id), [store, goal.id])
  const progress = store.getYearProgress(goal.id)

  return (
    <div className="p-5 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/plan/year')} className="flex items-center gap-1 text-primary text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <LayerIndicator layer="goal" />
      </div>

      {/* Vision card */}
      <div className="card p-5 mb-5 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bg}`} />
        <div className="pl-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{cfg.emoji}</span>
            <span className={`chip ${cfg.bg} ${cfg.color} text-[10px]`}>{cfg.label}</span>
          </div>
          <h2 className="text-lg font-bold mb-2">{goal.title}</h2>
          {goal.vision && (
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">{goal.vision}</p>
          )}
        </div>
      </div>

      {/* Progress overview */}
      <div className="card p-5 mb-5 flex items-center gap-5">
        <ProgressRing size={80} strokeWidth={7} progress={progress} color="var(--color-primary)">
          <div className="text-center">
            <p className="text-xl font-bold">{Math.round(progress * 100)}%</p>
            <p className="text-[9px] text-text-tertiary">完成率</p>
          </div>
        </ProgressRing>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">目标进度</p>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
            {quarters.length} 个季度目标
          </p>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quarter goals */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs font-semibold text-text-tertiary">季度目标</p>
        <button onClick={() => setShowAdd(true)} className="text-xs text-primary font-medium">+ 添加</button>
      </div>

      {quarters.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-text-tertiary">还没有季度目标</p>
          <p className="text-xs text-text-tertiary mt-1">把年目标拆解为季度里程碑</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quarters
            .sort((a, b) => a.quarter - b.quarter)
            .map((q) => {
              const qProgress = store.getQuarterProgress(q.id)
              const monthCount = store.getMonthPlans(q.id).length
              return (
                <button
                  key={q.id}
                  onClick={() => navigate(`/plan/quarter/${q.id}`)}
                  className="card w-full text-left p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="chip bg-accent-soft text-accent text-[10px] font-bold">Q{q.quarter}</span>
                      <span className="text-sm font-bold">{q.title}</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  {q.keyResults.length > 0 && (
                    <div className="space-y-1 mb-2.5">
                      {q.keyResults.map((kr, i) => (
                        <p key={i} className="text-xs text-text-secondary dark:text-text-secondary-dark flex items-start gap-1.5">
                          <span className="text-text-tertiary shrink-0">KR{i + 1}</span>
                          <span>{kr}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500"
                        style={{ width: `${qProgress * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-tertiary shrink-0">{monthCount} 月计划</span>
                  </div>
                </button>
              )
            })}
        </div>
      )}

      <AddGoalSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        mode="quarter"
        onSubmitQuarter={(data) => {
          store.addQuarterGoal({ yearGoalId: goal.id, year: goal.year, ...data })
        }}
      />
    </div>
  )
}
