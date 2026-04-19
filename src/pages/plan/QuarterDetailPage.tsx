import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { usePlanStore } from '../../stores/plan'
import { ProgressRing } from '../../components/ProgressRing'
import { LayerIndicator } from './components/LayerIndicator'
import { PlanBreadcrumb } from './components/PlanBreadcrumb'
import { AddGoalSheet } from './components/AddGoalSheet'

export default function QuarterDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = usePlanStore()
  const [showAdd, setShowAdd] = useState(false)

  const quarter = store.quarterGoals.find((q) => q.id === id)
  if (!quarter) return <div className="p-5 text-center text-text-tertiary">季度目标不存在</div>

  const yearGoal = store.yearGoals.find((y) => y.id === quarter.yearGoalId)
  const months = useMemo(() => store.getMonthPlans(quarter.id), [store, quarter.id])
  const progress = store.getQuarterProgress(quarter.id)

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
        <LayerIndicator layer="phase" />
      </div>

      {/* Breadcrumb */}
      <div className="mb-4">
        <PlanBreadcrumb ancestry={{ yearGoal, quarterGoal: quarter }} />
      </div>

      {/* Quarter info */}
      <div className="card p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="chip bg-accent-soft text-accent font-bold">Q{quarter.quarter} {quarter.year}</span>
          <h2 className="text-lg font-bold">{quarter.title}</h2>
        </div>

        {/* Key Results */}
        {quarter.keyResults.length > 0 && (
          <div className="space-y-2 mb-4">
            {quarter.keyResults.map((kr, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="chip bg-gray-100 dark:bg-gray-800 text-text-tertiary text-[10px] shrink-0 mt-0.5">KR{i + 1}</span>
                <span className="text-text-secondary dark:text-text-secondary-dark">{kr}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-4">
          <ProgressRing size={56} strokeWidth={5} progress={progress} color="var(--color-accent)">
            <span className="text-xs font-bold">{Math.round(progress * 100)}%</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-1">{months.length} 个月计划</p>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Month plans */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs font-semibold text-text-tertiary">月计划</p>
        <button onClick={() => setShowAdd(true)} className="text-xs text-primary font-medium">+ 添加</button>
      </div>

      {months.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-text-tertiary">还没有月计划</p>
          <p className="text-xs text-text-tertiary mt-1">把季度目标拆解为月度行动</p>
        </div>
      ) : (
        <div className="space-y-3">
          {months
            .sort((a, b) => a.month - b.month)
            .map((mp) => {
              const mProgress = store.getMonthProgress(mp.id)
              const weekCount = store.getWeekPlans(mp.id).length
              return (
                <button
                  key={mp.id}
                  onClick={() => navigate(`/plan/month/${mp.id}`)}
                  className="card w-full text-left p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="chip bg-warning-soft text-warning text-[10px] font-bold">{mp.month}月</span>
                      <span className="text-sm font-bold">{mp.title}</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  {mp.description && (
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark line-clamp-1 mb-2">{mp.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-warning to-primary rounded-full transition-all duration-500"
                        style={{ width: `${mProgress * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-tertiary shrink-0">{weekCount} 周计划</span>
                  </div>
                </button>
              )
            })}
        </div>
      )}

      <AddGoalSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        mode="month"
        onSubmitMonth={(data) => {
          store.addMonthPlan({ quarterGoalId: quarter.id, year: quarter.year, ...data })
        }}
      />
    </div>
  )
}
