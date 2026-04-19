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
    window.location.href = '/today'
  }

  const stats = [
    { label: '日记', count: diaryCount, color: 'text-primary', bg: 'bg-primary-soft' },
    { label: '习惯', count: habitCount, color: 'text-success', bg: 'bg-success-soft' },
    { label: '灵感', count: ideaCount, color: 'text-warning', bg: 'bg-warning-soft' },
    { label: '任务', count: taskCount, color: 'text-accent', bg: 'bg-accent-soft' },
  ]

  return (
    <div className="p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-primary text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <h2 className="text-base font-bold">设置</h2>
        <div className="w-10" />
      </div>

      {/* 数据统计 */}
      <div className="card p-5 mb-4">
        <p className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark mb-3">数据统计</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              </div>
              <p className="text-[11px] text-text-tertiary">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 主题 */}
      <div className="card mb-4 overflow-hidden">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
              <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
            </div>
            <div className="text-left">
              <span className="text-sm font-medium block">
                {theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
              </span>
              <span className="text-[11px] text-text-tertiary">
                当前：{theme === 'light' ? '浅色' : '深色'}
              </span>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-tertiary">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 数据与备份 */}
      <div className="card mb-4 overflow-hidden">
        <button
          onClick={() => navigate('/settings/backup')}
          className="w-full flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-success">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="text-left">
              <span className="text-sm font-medium block">数据与备份</span>
              <span className="text-[11px] text-text-tertiary">导出、导入备份文件</span>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-tertiary">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 清除数据 */}
      <div className="card mb-4 overflow-hidden">
        {showClear ? (
          <div className="p-4 border-danger/20 animate-scale-in">
            <p className="text-sm text-danger mb-3 font-medium">
              确定要清除所有数据吗？此操作不可撤销。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 bg-danger text-white rounded-xl py-2.5 text-sm font-medium"
              >
                确认清除
              </button>
              <button
                onClick={() => setShowClear(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 text-sm font-medium"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClear(true)}
            className="w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-danger">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <span className="text-sm text-danger font-medium">清除所有数据</span>
          </button>
        )}
      </div>

      {/* 关于 */}
      <div className="card p-5">
        <p className="text-sm font-bold mb-1">关于 LifeOS</p>
        <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
          v2.0.0 · 你的个人成长小助手
        </p>
        <p className="text-xs text-text-tertiary mt-1.5">
          数据完全存储在本地，无需联网
        </p>
      </div>
    </div>
  )
}
