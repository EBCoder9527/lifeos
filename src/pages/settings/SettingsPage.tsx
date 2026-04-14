import { useNavigate } from 'react-router'
import { useSettings } from '../../stores/settings'
import { useDiaryStore } from '../../stores/diary'
import { useHabitStore } from '../../stores/habit'
import { useIdeaStore } from '../../stores/idea'
import { useTaskStore } from '../../stores/task'
import { useState } from 'react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useSettings()
  const diaryCount = useDiaryStore((s) => s.diaries.length)
  const habitCount = useHabitStore((s) => s.habits.filter((h) => !h.archivedAt).length)
  const ideaCount = useIdeaStore((s) => s.ideas.length)
  const taskCount = useTaskStore((s) => s.tasks.length)
  const [showClear, setShowClear] = useState(false)

  const handleClearAll = () => {
    localStorage.clear()
    window.location.href = '/diary'
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 dark:text-blue-400 text-sm"
        >
          ← 返回
        </button>
        <h2 className="text-lg font-bold">设置</h2>
        <div className="w-10" />
      </div>

      {/* 数据统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
        <p className="text-sm font-medium mb-3">数据统计</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{diaryCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">日记</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{habitCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">习惯</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{ideaCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">灵感</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{taskCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">任务</p>
          </div>
        </div>
      </div>

      {/* 主题 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span className="text-sm">
              {theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            当前：{theme === 'light' ? '浅色' : '深色'}
          </span>
        </button>
      </div>

      {/* 清除数据 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4">
        {showClear ? (
          <div className="p-4">
            <p className="text-sm text-red-500 mb-3">
              确定要清除所有数据吗？此操作不可撤销。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium"
              >
                确认清除
              </button>
              <button
                onClick={() => setShowClear(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl py-2.5 text-sm"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClear(true)}
            className="w-full flex items-center gap-3 p-4"
          >
            <span className="text-xl">🗑️</span>
            <span className="text-sm text-red-500">清除所有数据</span>
          </button>
        )}
      </div>

      {/* 关于 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-medium mb-1">关于 DayFlow</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          v1.0.0 · 你的个人成长小助手
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          数据完全存储在本地，无需联网
        </p>
      </div>
    </div>
  )
}
