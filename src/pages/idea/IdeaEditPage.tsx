import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useIdeaStore } from '../../stores/idea'
import { RichTextEditor } from '../../components/RichTextEditor'
import { RichTextViewer } from '../../components/RichTextViewer'
import { useMessage } from '../../hooks/useMessage' // fix: unified showMessage
import dayjs from 'dayjs'
import type { IdeaCategory } from '../../types'

const categories: { value: IdeaCategory; emoji: string; label: string; color: string }[] = [
  { value: 'idea', emoji: '💡', label: '灵感', color: 'bg-warning-soft text-warning' },
  { value: 'note', emoji: '📝', label: '记录', color: 'bg-accent-soft text-accent' },
  { value: 'important', emoji: '⭐', label: '重要', color: 'bg-secondary-soft text-secondary' },
]

const categoryEmoji: Record<IdeaCategory, string> = { idea: '💡', note: '📝', important: '⭐' }
const categoryLabel: Record<IdeaCategory, string> = { idea: '灵感', note: '记录', important: '重要' }
const categoryChipColor: Record<IdeaCategory, string> = {
  idea: 'bg-warning-soft text-warning',
  note: 'bg-accent-soft text-accent',
  important: 'bg-secondary-soft text-secondary',
}

export default function IdeaEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ideas, addIdea, updateIdea, deleteIdea, getAllTags } = useIdeaStore()

  const existing = id ? ideas.find((i) => i.id === id) : undefined
  const isNew = !id

  const [isEditing, setIsEditing] = useState(isNew)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [content, setContent] = useState(existing?.content ?? '')
  const [category, setCategory] = useState<IdeaCategory>(existing?.category ?? 'idea')
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showMessage } = useMessage() // fix: unified showMessage
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const allTags = useMemo(() => getAllTags(), [ideas])
  const filteredSuggestions = useMemo(() => {
    if (!tagInput.trim()) return allTags.filter((t) => !tags.some((et) => et.toLowerCase() === t.toLowerCase()))
    const q = tagInput.trim().toLowerCase()
    return allTags.filter((t) => t.toLowerCase().includes(q) && !tags.some((et) => et.toLowerCase() === t.toLowerCase()))
  }, [tagInput, allTags, tags])

  // fix: delegate to unified showMessage
  const showToast = (msg: string) => showMessage('success', msg)

  useEffect(() => {
    if (id && !existing) navigate('/idea', { replace: true })
  }, [id, existing, navigate])

  const addTagFromInput = () => {
    const newTags = tagInput
      .split(/[,，\s]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean)
    if (newTags.length > 0) {
      setTags((prev) => [...new Set([...prev, ...newTags])])
      setTagInput('')
    }
    setShowSuggestions(false)
    setSelectedSuggestion(-1)
  }

  const selectSuggestion = (tag: string) => {
    setTags((prev) => [...new Set([...prev, tag])])
    setTagInput('')
    setShowSuggestions(false)
    setSelectedSuggestion(-1)
    tagInputRef.current?.focus()
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSave = () => {
    if (saving) return
    const trimmedTitle = title.trim()
    const trimmedContent = content.replace(/<[^>]*>/g, '').trim()
    if (!trimmedTitle && !trimmedContent) return
    const finalTitle = trimmedTitle || trimmedContent.slice(0, 20)
    setSaving(true)
    try {
      if (existing) {
        updateIdea(existing.id, { title: finalTitle, content, category, tags })
        setIsEditing(false)
        showToast('保存成功')
      } else {
        addIdea(finalTitle, content, category, tags)
        showToast('灵感添加成功') // fix: add idea toast
        navigate('/idea')
      }
    } catch {
      showMessage('error', '保存失败，请重试') // fix: error type for failures
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (existing) {
      setTitle(existing.title)
      setContent(existing.content)
      setCategory(existing.category)
      setTags(existing.tags ?? [])
      setTagInput('')
      setIsEditing(false)
    } else {
      navigate('/idea')
    }
  }

  const handleDelete = () => {
    if (existing) {
      deleteIdea(existing.id)
      showToast('灵感已删除') // fix: delete idea toast
      navigate('/idea')
    }
  }

  // ─── Read Mode ───
  if (!isEditing && existing) {
    return (
      <div className="p-5 pb-24 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/idea')}
            className="flex items-center gap-1 text-primary text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            返回
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-primary text-sm font-medium px-3 py-1.5 rounded-full bg-primary-soft transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            编辑
          </button>
        </div>

        {/* Category */}
        <div className="mb-4">
          <span className={`chip ${categoryChipColor[existing.category]}`}>
            {categoryEmoji[existing.category]} {categoryLabel[existing.category]}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold mb-4">{existing.title}</h1>

        {/* Content */}
        <div className="card p-5 mb-5">
          <RichTextViewer content={existing.content} className="diary-content" />
        </div>

        {/* Tags */}
        {existing.tags && existing.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-5">
            {existing.tags.map((tag) => (
              <span key={tag} className="chip bg-primary-soft text-primary">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <p className="text-[10px] text-text-tertiary mb-6">
          创建于 {dayjs(existing.createdAt).format('M/D HH:mm')}
          {existing.updatedAt !== existing.createdAt && (
            <> · 编辑于 {dayjs(existing.updatedAt).format('M/D HH:mm')}</>
          )}
        </p>

        {/* Delete */}
        <div className="mt-4">
          {showDelete ? (
            <div className="card p-4 border-danger/20 animate-scale-in">
              <p className="text-sm text-danger mb-3 font-medium">确定要删除这条灵感吗？</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} className="flex-1 bg-danger text-white rounded-xl py-2.5 text-sm font-medium">
                  确认删除
                </button>
                <button onClick={() => setShowDelete(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 text-sm font-medium">
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDelete(true)} className="w-full text-danger/60 text-sm py-2 hover:text-danger transition-colors">
              删除这条灵感
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── Edit Mode ───
  return (
    <div className="p-5 flex flex-col min-h-[calc(100vh-7rem)] animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={handleCancel}
          className="flex items-center gap-1 text-text-secondary text-sm font-medium"
        >
          {existing ? (
            '取消'
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              返回
            </>
          )}
        </button>
        <h2 className="text-base font-bold">{existing ? '编辑灵感' : '记录灵感'}</h2>
        <button
          onClick={handleSave}
          disabled={saving || (!title.trim() && !content.replace(/<[^>]*>/g, '').trim())}
          className="btn-primary !px-5 !py-2 text-sm"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2 block">类型</label>
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                category === c.value
                  ? `${c.color} border-current`
                  : 'border-transparent bg-gray-50 dark:bg-gray-800 text-text-secondary'
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-1.5 block">标题</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给灵感起个标题..."
          className="input"
          autoFocus
        />
      </div>

      {/* Tags */}
      <div className="mb-4 relative">
        <label className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-1.5 block">标签</label>
        {tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => removeTag(tag)}
                className="chip bg-primary-soft text-primary"
              >
                #{tag} &times;
              </button>
            ))}
          </div>
        )}
        <input
          ref={tagInputRef}
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value)
            setShowSuggestions(true)
            setSelectedSuggestion(-1)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow suggestion click
            setTimeout(() => {
              addTagFromInput()
              setShowSuggestions(false)
            }, 150)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setSelectedSuggestion((prev) => Math.min(prev + 1, filteredSuggestions.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setSelectedSuggestion((prev) => Math.max(prev - 1, -1))
            } else if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              if (selectedSuggestion >= 0 && filteredSuggestions[selectedSuggestion]) {
                selectSuggestion(filteredSuggestions[selectedSuggestion])
              } else {
                addTagFromInput()
              }
            } else if (e.key === 'Escape') {
              setShowSuggestions(false)
            }
          }}
          placeholder="输入标签，回车添加"
          className="input"
        />
        {/* Tag suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute left-0 right-0 mt-1 bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-20 max-h-40 overflow-y-auto"
          >
            {filteredSuggestions.slice(0, 8).map((tag, i) => (
              <button
                key={tag}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(tag)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  i === selectedSuggestion
                    ? 'bg-primary-soft text-primary font-medium'
                    : 'text-text-primary dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 mb-4">
        <label className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-1.5 block">内容</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="记录你的想法..."
          className="input !p-0 overflow-hidden min-h-[220px]"
        />
      </div>

      {/* fix: toast now handled by global MessageProvider */}
    </div>
  )
}
