import { useState, useRef } from 'react'
import type { GoalCategory } from '../../../types'
import { categoryConfig } from './LayerIndicator'

const categories: GoalCategory[] = ['career', 'health', 'learning', 'relationship', 'finance', 'hobby', 'other']

interface AddGoalSheetProps {
  open: boolean
  onClose: () => void
  mode: 'year' | 'quarter' | 'month' | 'week'
  parentId?: string
  defaults?: { year?: number; quarter?: 1|2|3|4; month?: number }
  onSubmitYear?: (data: { title: string; vision: string; category: GoalCategory }) => void
  onSubmitQuarter?: (data: { title: string; keyResults: string[]; quarter: 1|2|3|4 }) => void
  onSubmitMonth?: (data: { title: string; description: string; month: number }) => void
  onSubmitWeek?: (data: { title: string }) => void
}

export function AddGoalSheet({ open, onClose, mode, defaults, onSubmitYear, onSubmitQuarter, onSubmitMonth, onSubmitWeek }: AddGoalSheetProps) {
  const [title, setTitle] = useState('')
  const [vision, setVision] = useState('')
  const [category, setCategory] = useState<GoalCategory>('career')
  const [keyResults, setKeyResults] = useState(['', '', ''])
  const [description, setDescription] = useState('')
  const [quarter, setQuarter] = useState<1|2|3|4>(defaults?.quarter || 1)
  const [month, setMonth] = useState(defaults?.month || 1)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const reset = () => {
    setTitle('')
    setVision('')
    setCategory('career')
    setKeyResults(['', '', ''])
    setDescription('')
  }

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    if (mode === 'year' && onSubmitYear) {
      onSubmitYear({ title: trimmed, vision: vision.trim(), category })
    } else if (mode === 'quarter' && onSubmitQuarter) {
      onSubmitQuarter({ title: trimmed, keyResults: keyResults.filter((kr) => kr.trim()), quarter })
    } else if (mode === 'month' && onSubmitMonth) {
      onSubmitMonth({ title: trimmed, description: description.trim(), month })
    } else if (mode === 'week' && onSubmitWeek) {
      onSubmitWeek({ title: trimmed })
    }
    reset()
    onClose()
  }

  const titles: Record<string, string> = {
    year: '添加年目标',
    quarter: '添加季度目标',
    month: '添加月计划',
    week: '添加周计划',
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-surface dark:bg-surface-dark rounded-t-3xl p-5 safe-bottom animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{titles[mode]}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={mode === 'year' ? '你的年度目标...' : mode === 'quarter' ? '这个季度要达成什么...' : mode === 'month' ? '这个月的重点...' : '本周主题...'}
          className="input mb-3"
          autoFocus
        />

        {/* Year: vision + category */}
        {mode === 'year' && (
          <>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="愿景描述：为什么这个目标对你重要..."
              rows={3}
              className="input resize-none mb-3 leading-relaxed"
            />
            <div className="mb-4">
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">分类</p>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => {
                  const cfg = categoryConfig[cat]
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        category === cat
                          ? `${cfg.bg} ${cfg.color} border-current`
                          : 'border-transparent bg-gray-50 dark:bg-gray-800 text-text-secondary'
                      }`}
                    >
                      <span>{cfg.emoji}</span>
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Quarter: key results + quarter select */}
        {mode === 'quarter' && (
          <>
            <div className="mb-3">
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">季度</p>
              <div className="flex gap-2">
                {([1, 2, 3, 4] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuarter(q)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      quarter === q ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-text-secondary'
                    }`}
                  >
                    Q{q}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">关键结果 (KR)</p>
              {keyResults.map((kr, i) => (
                <input
                  key={i}
                  value={kr}
                  onChange={(e) => {
                    const next = [...keyResults]
                    next[i] = e.target.value
                    setKeyResults(next)
                  }}
                  placeholder={`KR${i + 1}: 可衡量的成果...`}
                  className="input mb-2"
                />
              ))}
            </div>
          </>
        )}

        {/* Month: description + month select */}
        {mode === 'month' && (
          <>
            <div className="mb-3">
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2">月份</p>
              <div className="grid grid-cols-6 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonth(m)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all ${
                      month === m ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-text-secondary'
                    }`}
                  >
                    {m}月
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="月度计划描述..."
              rows={2}
              className="input resize-none mb-4 leading-relaxed"
            />
          </>
        )}

        <button onClick={handleSubmit} disabled={!title.trim()} className="btn-primary w-full !py-3">
          {mode === 'year' ? '创建目标' : mode === 'quarter' ? '创建季度目标' : mode === 'month' ? '创建月计划' : '创建周计划'}
        </button>
      </div>
    </div>
  )
}
