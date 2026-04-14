import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Layout } from './components/Layout'
import DiaryPage from './pages/diary/DiaryPage'
import DiaryEditPage from './pages/diary/DiaryEditPage'
import HabitPage from './pages/habit/HabitPage'
import HabitManagePage from './pages/habit/HabitManagePage'
import IdeaPage from './pages/idea/IdeaPage'
import TaskPage from './pages/task/TaskPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/diary/new" element={<DiaryEditPage />} />
          <Route path="/diary/:id" element={<DiaryEditPage />} />
          <Route path="/habit" element={<HabitPage />} />
          <Route path="/habit/manage" element={<HabitManagePage />} />
          <Route path="/idea" element={<IdeaPage />} />
          <Route path="/task" element={<TaskPage />} />
          <Route path="*" element={<Navigate to="/diary" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
