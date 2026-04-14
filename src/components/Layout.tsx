import { Outlet, useNavigate } from 'react-router'
import { TabBar } from './TabBar'
import { useSettings } from '../stores/settings'
import { useEffect } from 'react'

export function Layout() {
  const { theme, toggleTheme } = useSettings()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
          <h1
            className="text-lg font-semibold cursor-pointer"
            onClick={() => navigate('/diary')}
          >
            DayFlow
          </h1>
          <button
            onClick={toggleTheme}
            className="text-xl p-1"
            aria-label="切换主题"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="pb-16 max-w-lg mx-auto">
        <Outlet />
      </main>

      <TabBar />
    </div>
  )
}
