import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Layout } from './components/Layout'
import TodayPage from './pages/today/TodayPage'
import DiaryPage from './pages/diary/DiaryPage'
import DiaryEditPage from './pages/diary/DiaryEditPage'
import HabitPage from './pages/habit/HabitPage'
import HabitManagePage from './pages/habit/HabitManagePage'
import IdeaPage from './pages/idea/IdeaPage'
import IdeaEditPage from './pages/idea/IdeaEditPage'
import PlanHomePage from './pages/plan/PlanHomePage'
import WeekPlanPage from './pages/plan/WeekPlanPage'
import YearGoalPage from './pages/plan/YearGoalPage'
import YearGoalDetailPage from './pages/plan/YearGoalDetailPage'
import QuarterDetailPage from './pages/plan/QuarterDetailPage'
import MonthDetailPage from './pages/plan/MonthDetailPage'
import SettingsPage from './pages/settings/SettingsPage'
import BackupPage from './pages/settings/BackupPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/today" element={<TodayPage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/diary/new" element={<DiaryEditPage />} />
          <Route path="/diary/:id" element={<DiaryEditPage />} />
          <Route path="/habit" element={<HabitPage />} />
          <Route path="/habit/manage" element={<HabitManagePage />} />
          <Route path="/idea" element={<IdeaPage />} />
          <Route path="/idea/new" element={<IdeaEditPage />} />
          <Route path="/idea/:id" element={<IdeaEditPage />} />
          <Route path="/plan" element={<PlanHomePage />} />
          <Route path="/plan/week" element={<WeekPlanPage />} />
          <Route path="/plan/week/:id" element={<WeekPlanPage />} />
          <Route path="/plan/year" element={<YearGoalPage />} />
          <Route path="/plan/year/:id" element={<YearGoalDetailPage />} />
          <Route path="/plan/quarter/:id" element={<QuarterDetailPage />} />
          <Route path="/plan/month/:id" element={<MonthDetailPage />} />
          <Route path="/task" element={<Navigate to="/plan" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/backup" element={<BackupPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
