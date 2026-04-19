import { useNavigate } from 'react-router'
import type { YearGoal, QuarterGoal, MonthPlan, WeekPlan } from '../../../types'

interface AncestryData {
  yearGoal?: YearGoal
  quarterGoal?: QuarterGoal
  monthPlan?: MonthPlan
  weekPlan?: WeekPlan
}

interface PlanBreadcrumbProps {
  ancestry: AncestryData
}

export function PlanBreadcrumb({ ancestry }: PlanBreadcrumbProps) {
  const navigate = useNavigate()
  const { yearGoal, quarterGoal, monthPlan } = ancestry

  if (!yearGoal && !quarterGoal && !monthPlan) return null

  const crumbs: { label: string; path: string }[] = []
  if (yearGoal) crumbs.push({ label: yearGoal.title, path: `/plan/year/${yearGoal.id}` })
  if (quarterGoal) crumbs.push({ label: `Q${quarterGoal.quarter}`, path: `/plan/quarter/${quarterGoal.id}` })
  if (monthPlan) crumbs.push({ label: `${monthPlan.month}月`, path: `/plan/month/${monthPlan.id}` })

  return (
    <div className="flex items-center gap-1 text-xs px-1 overflow-x-auto scrollbar-none">
      <span className="text-text-tertiary shrink-0">来自</span>
      {crumbs.map((c, i) => (
        <span key={c.path} className="flex items-center gap-1 shrink-0">
          {i > 0 && <span className="text-text-tertiary">›</span>}
          <button
            onClick={() => navigate(c.path)}
            className="chip bg-primary-soft text-primary hover:bg-primary/20 transition-colors"
          >
            {c.label}
          </button>
        </span>
      ))}
    </div>
  )
}
