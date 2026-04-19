import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useHabitStore } from '../../stores/habit'
import type { HabitFrequency } from '../../types'

const iconCategories = [
  { name: '运动健身', icons: ['🏃', '🏋️', '🧘', '🚴', '🏊', '⚽', '🎾', '🧗'] },
  { name: '学习成长', icons: ['📖', '✍️', '📝', '💻', '🎓', '🧠', '📚', '🔬'] },
  { name: '健康生活', icons: ['💧', '🥗', '💊', '😴', '🧹', '🌅', '🍎', '🫁'] },
  { name: '兴趣爱好', icons: ['🎵', '🎨', '📸', '🎮', '🌱', '🐕', '✈️', '🎯'] },
  { name: '自我管理', icons: ['📵', '💰', '🙏', '⏰', '📊', '💪', '☀️', '🧘‍♂️'] },
]

const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

type FreqMode = 'daily' | 'workdays' | 'custom'

export default function HabitManagePage() {
  const navigate = useNavigate()
  const { habits, addHabit, archiveHabit } = useHabitStore()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📖')
  const [customIconInput, setCustomIconInput] = useState('')
  const [expandedCategory, setExpandedCategory] = useState(0)
  const [freqMode, setFreqMode] = useState<FreqMode>('daily')
  const [customDays, setCustomDays] = useState<number[]>([])
  const [showArchiveId, setShowArchiveId] = useState<string | null>(null)

  const activeHabits = habits.filter((h) => !h.archivedAt)

  const buildFrequency = (): HabitFrequency => {
    if (freqMode === 'daily') return { type: 'daily' }
    if (freqMode === 'workdays') return { type: 'weekly', days: [1, 2, 3, 4, 5] }
    return { type: 'weekly', days: [...customDays].sort() }
  }

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (freqMode === 'custom' && customDays.length === 0) return
    addHabit(trimmed, icon, buildFrequency())
    setName('')
    setIcon('📖')
    setCustomIconInput('')
    setFreqMode('daily')
    setCustomDays([])
  }

  const handleCustomIcon = (val: string) => {
    setCustomIconInput(val)
    // Extract the first emoji-like character
    const match = val.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/u)
    if (match) {
      setIcon(match[0])
    }
  }

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const freqLabel = (habit: typeof activeHabits[0]) => {
    if (habit.frequency.type === 'daily') return '每天'
    const days = habit.frequency.days
    if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return '工作日'
    return days.map((d) => dayLabels[d]).join('、')
  }

  return (
    <div className="p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/habit')} className="flex items-center gap-1 text-primary text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <h2 className="text-base font-bold">管理习惯</h2>
        <div className="w-10" />
      </div>

      {/* 添加 */}
      <div className="card p-5 mb-6">
        <p className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark mb-3">添加新习惯</p>

        {/* Icon picker - categorized */}
        <div className="mb-4 space-y-2">
          {iconCategories.map((cat, ci) => (
            <div key={cat.name}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === ci ? -1 : ci)}
                className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-1.5 w-full"
              >
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round"
                  className={`transition-transform ${expandedCategory === ci ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 6 15 12 9 18" />
                </svg>
                {cat.name}
              </button>
              {expandedCategory === ci && (
                <div className="flex gap-2 flex-wrap animate-fade-in">
                  {cat.icons.map((e) => (
                    <button
                      key={e}
                      onClick={() => { setIcon(e); setCustomIconInput('') }}
                      className={`text-xl w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                        icon === e && !customIconInput
                          ? 'bg-primary-soft ring-2 ring-primary scale-110'
                          : 'bg-gray-50 dark:bg-gray-800 hover:scale-105'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Custom emoji input */}
          <div className="flex items-center gap-2 mt-2">
            <input
              value={customIconInput}
              onChange={(e) => handleCustomIcon(e.target.value)}
              placeholder="或输入自定义 emoji"
              className="input flex-1 !py-2 text-xs"
            />
            {customIconInput && (
              <div className="w-10 h-10 rounded-xl bg-primary-soft ring-2 ring-primary flex items-center justify-center text-xl">
                {icon}
              </div>
            )}
          </div>
        </div>

        {/* Frequency selector */}
        <div className="mb-4">
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">频率</p>
          <div className="flex gap-2 mb-2">
            {([
              { mode: 'daily' as FreqMode, label: '每天' },
              { mode: 'workdays' as FreqMode, label: '工作日' },
              { mode: 'custom' as FreqMode, label: '自定义' },
            ]).map((opt) => (
              <button
                key={opt.mode}
                onClick={() => setFreqMode(opt.mode)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  freqMode === opt.mode
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-gray-50 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {freqMode === 'custom' && (
            <div className="flex gap-1.5 animate-fade-in">
              {dayLabels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    customDays.includes(i)
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-gray-50 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name + Add */}
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="习惯名称，如：读书 10 分钟"
            className="input flex-1"
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim() || (freqMode === 'custom' && customDays.length === 0)}
            className="btn-primary"
          >
            添加
          </button>
        </div>
      </div>

      {/* 列表 */}
      {activeHabits.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-tertiary mb-3 px-1">
            当前习惯（{activeHabits.length}）
          </p>
          <div className="space-y-2 stagger-children">
            {activeHabits.map((habit) => (
              <div key={habit.id} className="card flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${habit.color}18` }}>
                  {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{habit.name}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">{freqLabel(habit)}</p>
                </div>
                {showArchiveId === habit.id ? (
                  <div className="flex gap-2 animate-scale-in">
                    <button
                      onClick={() => { archiveHabit(habit.id); setShowArchiveId(null) }}
                      className="text-xs bg-danger text-white px-3 py-1.5 rounded-full font-medium"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setShowArchiveId(null)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full font-medium"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowArchiveId(habit.id)} className="text-xs text-danger/60 hover:text-danger transition-colors">
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
