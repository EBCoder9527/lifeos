import { Navigate } from 'react-router'
import { usePlanStore } from '../../stores/plan'

export default function PlanHomePage() {
  const currentWeek = usePlanStore((s) => s.getCurrentWeekPlan())

  if (currentWeek) {
    return <Navigate to={`/plan/week/${currentWeek.id}`} replace />
  }

  return <Navigate to="/plan/week" replace />
}
