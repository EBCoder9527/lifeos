import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Layout } from './components/Layout'
import { MessageProvider } from './hooks/useMessage' // fix: unified showMessage
import { SplashScreen } from './components/SplashScreen'
import { initApp } from './db/init'
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

const MIN_SPLASH_MS = 800

export default function App() {
  const [ready, setReady] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    const start = Date.now()

    initApp()
      .catch((err) => console.error('[LifeOS] initApp failed:', err))
      .finally(() => {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, MIN_SPLASH_MS - elapsed)
        setTimeout(() => setReady(true), remaining)
      })
  }, [])

  useEffect(() => {
    if (!ready) return
    // Remove the HTML inline splash (from index.html)
    const boot = document.getElementById('_boot')
    if (boot) boot.remove()

    // Start fade-out
    setFadeOut(true)
    const timer = setTimeout(() => setSplashDone(true), 500) // match CSS transition duration
    return () => clearTimeout(timer)
  }, [ready])

  return (
    <MessageProvider>{/* fix: wrap app with unified message provider */}
      <SplashScreen visible={!splashDone} fadeOut={fadeOut} />
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
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
    </MessageProvider>
  )
}
