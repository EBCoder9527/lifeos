import { Outlet, useNavigate, useLocation } from 'react-router'
import { TabBar } from './TabBar'
import { QuickAdd } from './QuickAdd'
import { useSettings } from '../stores/settings'
import { useEffect, useState, useCallback } from 'react'

export function Layout() {
  const { theme } = useSettings()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#faf8f5')
    }
  }, [theme])

  // 页面切换时自动回到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Show scroll-to-top button after scrolling 1/3 viewport
  useEffect(() => {
    const threshold = window.innerHeight / 3
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > threshold)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

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

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed right-5 z-30 w-10 h-10 rounded-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ bottom: 'calc(10rem + env(safe-area-inset-bottom, 0px))' }}
        aria-label="回到顶部"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  )
}
