import { useState } from 'react'
import { useNavigate } from 'react-router'
import { usePlanStore } from '../../stores/plan'
import { ProgressRing } from '../../components/ProgressRing'
import { LayerIndicator, categoryConfig } from './components/LayerIndicator'
import { AddGoalSheet } from './components/AddGoalSheet'

export default function YearGoalPage() {
  const navigate = useNavigate()
  const store = usePlanStore()
  const [showAdd, setShowAdd] = useState(false)
  const currentYear = new Date().getFullYear()

  const goals = store.yearGoals.filter((g) => g.status !== 'abandoned')

  return (
    <div className="p-5 stagger-children">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate('/plan')} className="flex items-center gap-1 text-primary text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <LayerIndicator layer="goal" />
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">年度目标</h2>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">{currentYear}年</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">添加</button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-5xl mb-4 animate-float">🏔️</div>
          <p className="text-text-secondary dark:text-text-secondary-dark font-medium">设定你的年度方向</p>
          <p className="text-sm text-text-tertiary mt-1">长远目标让每一天更有意义</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const cfg = categoryConfig[goal.category]
            const progress = store.getYearProgress(goal.id)
            const quarterCount = store.getQuarterGoals(goal.id).length

            return (
              <button
                key={goal.id}
                onClick={() => navigate(`/plan/year/${goal.id}`)}
                className="card w-full text-left p-5 relative overflow-hidden"
              >
                {/* Category color side strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bg}`} />

                <div className="flex items-start gap-4 pl-2">
                  <div className={`w-11 h-11 rounded-2xl ${cfg.bg} flex items-center justify-center text-xl shrink-0`}>
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`chip ${cfg.bg} ${cfg.color} text-[10px]`}>{cfg.label}</span>
                      {goal.status === 'achieved' && (
                        <span className="chip bg-success-soft text-success text-[10px]">已达成</span>
                      )}
                    </div>
                    <p className="text-base font-bold mb-1">{goal.title}</p>
                    {goal.vision && (
                      <p className="text-xs text-text-secondary dark:text-text-secondary-dark line-clamp-2">{goal.vision}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2.5">
                      <ProgressRing size={36} strokeWidth={3} progress={progress} color="var(--color-primary)">
                        <span className="text-[9px] font-bold">{Math.round(progress * 100)}%</span>
                      </ProgressRing>
                      <span className="text-[11px] text-text-tertiary">{quarterCount} 个季度目标</span>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary shrink-0 mt-3">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <AddGoalSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        mode="year"
        defaults={{ year: currentYear }}
        onSubmitYear={(data) => {
          store.addYearGoal({ ...data, year: currentYear })
        }}
      />
    </div>
  )
}
