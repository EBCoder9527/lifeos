import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useIdeaStore } from '../../stores/idea'
import dayjs from 'dayjs'
import type { IdeaCategory } from '../../types'

const categoryFilters: { value: IdeaCategory | 'all'; emoji: string; label: string }[] = [
  { value: 'all', emoji: '', label: '全部' },
  { value: 'idea', emoji: '💡', label: '灵感' },
  { value: 'note', emoji: '📝', label: '记录' },
  { value: 'important', emoji: '⭐', label: '重要' },
]

const categoryEmoji: Record<IdeaCategory, string> = { idea: '💡', note: '📝', important: '⭐' }
const categoryChipColor: Record<IdeaCategory, string> = {
  idea: 'bg-warning-soft text-warning',
  note: 'bg-accent-soft text-accent',
  important: 'bg-secondary-soft text-secondary',
}

export default function IdeaPage() {
  const navigate = useNavigate()
  const { ideas } = useIdeaStore()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<IdeaCategory | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // All unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    ideas.forEach((i) => i.tags?.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [ideas])

  // Filtered ideas
  const filtered = useMemo(() => {
    let list = ideas
    if (categoryFilter !== 'all') {
      list = list.filter((i) => i.category === categoryFilter)
    }
    if (selectedTags.length > 0) {
      list = list.filter((i) => selectedTags.some((t) => i.tags?.includes(t)))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q)
      )
    }
    return list
  }, [ideas, categoryFilter, selectedTags, search])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="p-5 stagger-children">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold">灵感</h2>
        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
          共 {ideas.length} 条{filtered.length !== ideas.length && ` · 筛选出 ${filtered.length} 条`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索标题或内容..."
          className="input !pl-10"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        {categoryFilters.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategoryFilter(c.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              categoryFilter === c.value
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-gray-50 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark'
            }`}
          >
            {c.emoji && <span className="mr-1">{c.emoji}</span>}
            {c.label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`chip transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-white'
                  : 'bg-primary-soft text-primary'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="text-5xl mb-4 animate-float">💡</div>
          <p className="text-text-secondary dark:text-text-secondary-dark font-medium">
            {ideas.length === 0 ? '还没有灵感' : '没有匹配的灵感'}
          </p>
          <p className="text-sm text-text-tertiary mt-1">
            {ideas.length === 0 ? '点击右下角记录你的第一个想法' : '试试调整筛选条件'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-24">
          {filtered.map((idea) => (
            <button
              key={idea.id}
              onClick={() => navigate(`/idea/${idea.id}`)}
              className="card w-full text-left p-4 transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                {/* Category icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${categoryChipColor[idea.category] || 'bg-gray-100'}`}>
                  {categoryEmoji[idea.category] || '💡'}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <p className="text-sm font-medium truncate">{idea.title}</p>
                  {/* Content preview */}
                  {idea.content && (
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1 line-clamp-2 leading-relaxed">
                      {idea.content}
                    </p>
                  )}
                  {/* Tags + time */}
                  <div className="flex items-center gap-2 mt-2">
                    {idea.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="chip !py-0.5 !px-2 !text-[10px] bg-primary-soft text-primary">
                        #{tag}
                      </span>
                    ))}
                    {idea.tags && idea.tags.length > 2 && (
                      <span className="text-[10px] text-text-tertiary">+{idea.tags.length - 2}</span>
                    )}
                    <span className="text-[10px] text-text-tertiary ml-auto shrink-0">
                      {dayjs(idea.createdAt).format('M/D HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/idea/new')}
        className="fixed right-5 bottom-24 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}
