import { Outlet, useNavigate } from 'react-router'
import { TabBar } from './TabBar'
import { QuickAdd } from './QuickAdd'
import { useSettings } from '../stores/settings'
import { useEffect } from 'react'

export function Layout() {
  const { theme } = useSettings()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#faf8f5')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-cream dark:bg-cream-dark text-text-primary dark:text-text-primary-dark">
      <header className="sticky top-0 z-30 glass border-b border-white/20 dark:border-white/5">
        <div className="flex items-center justify-between h-12 px-5 max-w-lg mx-auto">
          <h1
            className="text-lg font-bold cursor-pointer gradient-text"
            onClick={() => navigate('/today')}
          >
            LifeOS
          </h1>
          <button
            onClick={() => navigate('/settings')}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-soft transition-colors"
            aria-label="设置"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="pb-20 max-w-lg mx-auto">
        <Outlet />
      </main>

      <TabBar />
      <QuickAdd />
    </div>
  )
}
