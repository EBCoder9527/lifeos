import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useHabitStore } from '../../stores/habit'

const presetIcons = ['📖', '🏃', '💧', '🧘', '✍️', '🎵', '💊', '🥗', '😴', '🧹', '📵', '🌅']

export default function HabitManagePage() {
  const navigate = useNavigate()
  const { habits, addHabit, archiveHabit } = useHabitStore()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📖')
  const [showArchiveId, setShowArchiveId] = useState<string | null>(null)

  const activeHabits = habits.filter((h) => !h.archivedAt)

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addHabit(trimmed, icon)
    setName('')
    setIcon('📖')
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/habit')}
          className="text-blue-600 dark:text-blue-400 text-sm"
        >
          ← 返回
        </button>
        <h2 className="text-lg font-bold">管理习惯</h2>
        <div className="w-10" />
      </div>

      {/* 添加新习惯 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
        <p className="text-sm font-medium mb-3">添加新习惯</p>
        <div className="flex gap-2 flex-wrap mb-3">
          {presetIcons.map((e) => (
            <button
              key={e}
              onClick={() => setIcon(e)}
              className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                icon === e
                  ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="习惯名称，如：读书 10 分钟"
            className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 placeholder:text-gray-400"
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="bg-blue-600 text-white text-sm px-4 rounded-lg font-medium disabled:opacity-40"
          >
            添加
          </button>
        </div>
      </div>

      {/* 已有习惯列表 */}
      {activeHabits.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3 text-gray-500 dark:text-gray-400">
            当前习惯（{activeHabits.length}）
          </p>
          <div className="space-y-2">
            {activeHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
              >
                <span className="text-2xl">{habit.icon}</span>
                <span className="flex-1 text-sm font-medium">{habit.name}</span>
                {showArchiveId === habit.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        archiveHabit(habit.id)
                        setShowArchiveId(null)
                      }}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded-full"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setShowArchiveId(null)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowArchiveId(habit.id)}
                    className="text-xs text-red-500"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
