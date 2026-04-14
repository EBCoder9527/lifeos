import { NavLink } from 'react-router'

const tabs = [
  { path: '/diary', label: '日记', icon: '📔' },
  { path: '/habit', label: '习惯', icon: '✅' },
  { path: '/idea', label: '灵感', icon: '💡' },
  { path: '/task', label: '计划', icon: '📋' },
]

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
