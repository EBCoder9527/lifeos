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
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editKRs, setEditKRs] = useState('')

  const quarter = store.quarterGoals.find((q) => q.id === id)
  if (!quarter) return <div className="p-5 text-center text-text-tertiary">季度目标不存在</div>

  const yearGoal = store.yearGoals.find((y) => y.id === quarter.yearGoalId)
  const months = useMemo(() => store.getMonthPlans(quarter.id), [store, quarter.id])
  const progress = store.getQuarterProgress(quarter.id)

  const openEdit = () => {
    setEditTitle(quarter.title)
    setEditKRs(quarter.keyResults.join('\n'))
    setShowEdit(true)
  }

  const handleSaveEdit = () => {
    const t = editTitle.trim()
    if (!t) return
    const krs = editKRs.split('\n').map((s) => s.trim()).filter(Boolean)
    store.updateQuarterGoal(quarter.id, { title: t, keyResults: krs })
    setShowEdit(false)
  }

  const handleDelete = () => {
    store.deleteQuarterGoal(quarter.id)
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
          <LayerIndicator layer="phase" />
        </div>
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

      {/* Edit sheet */}
      {showEdit && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="w-full max-w-lg bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">编辑季度目标</h3>
              <button onClick={() => setShowEdit(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="季度目标标题" className="input mb-3" autoFocus />
            <textarea value={editKRs} onChange={(e) => setEditKRs(e.target.value)} placeholder="关键结果（每行一个）" rows={4} className="input resize-none mb-4" />
            <button onClick={handleSaveEdit} disabled={!editTitle.trim()} className="btn-primary w-full !py-3">保存</button>
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="mt-6">
        {showDelete ? (
          <div className="card p-4 border-danger/20 animate-scale-in">
            <p className="text-sm text-danger mb-3 font-medium">确定要删除这个季度目标吗？</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 bg-danger text-white rounded-xl py-2.5 text-sm font-medium">确认删除</button>
              <button onClick={() => setShowDelete(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 text-sm font-medium">取消</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDelete(true)} className="w-full text-danger/60 text-sm py-2 hover:text-danger transition-colors">
            删除这个季度目标
          </button>
        )}
      </div>
    </div>
  )
}
