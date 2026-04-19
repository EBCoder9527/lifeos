import { NavLink } from 'react-router'

const tabs = [
  { path: '/today', label: '今日', icon: TabIconToday, activeIcon: TabIconTodayActive },
  { path: '/diary', label: '日记', icon: TabIconDiary, activeIcon: TabIconDiaryActive },
  { path: '/habit', label: '习惯', icon: TabIconHabit, activeIcon: TabIconHabitActive },
  { path: '/idea', label: '灵感', icon: TabIconIdea, activeIcon: TabIconIdeaActive },
  { path: '/plan', label: '计划', icon: TabIconTask, activeIcon: TabIconTaskActive },
]

function TabIconToday() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function TabIconTodayActive() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
      <circle cx="12" cy="12" r="10" opacity="0.15" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TabIconDiary() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  )
}

function TabIconDiaryActive() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" opacity="0.15" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7h8M8 11h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TabIconHabit() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function TabIconHabitActive() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
      <circle cx="12" cy="12" r="10" opacity="0.15" />
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TabIconIdea() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </svg>
  )
}

function TabIconIdeaActive() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" opacity="0.15" />
      <path d="M9 18h6M10 22h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function TabIconTask() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 12h8M8 8h8M8 16h4" />
    </svg>
  )
}

function TabIconTaskActive() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
      <rect x="3" y="3" width="18" height="18" rx="3" opacity="0.15" />
      <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12h8M8 8h8M8 16h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/20 dark:border-white/5 safe-bottom z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-medium py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary dark:text-text-secondary-dark'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {isActive ? <tab.activeIcon /> : <tab.icon />}
                </div>
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
