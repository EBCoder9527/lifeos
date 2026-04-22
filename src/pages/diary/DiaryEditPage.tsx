import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDiaryStore } from '../../stores/diary'
import { RichTextEditor } from '../../components/RichTextEditor'
import { RichTextViewer } from '../../components/RichTextViewer'
import { useMessage } from '../../hooks/useMessage' // fix: unified showMessage
import dayjs from 'dayjs'
import type { Diary } from '../../types'

const moods: { value: Diary['mood']; emoji: string; label: string; color: string }[] = [
  { value: 'happy', emoji: '😊', label: '开心', color: 'bg-warning-soft border-warning' },
  { value: 'calm', emoji: '😌', label: '平静', color: 'bg-accent-soft border-accent' },
  { value: 'sad', emoji: '😢', label: '难过', color: 'bg-primary-soft border-primary' },
  { value: 'angry', emoji: '😤', label: '烦躁', color: 'bg-secondary-soft border-secondary' },
  { value: 'tired', emoji: '😴', label: '疲惫', color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' },
]

const moodEmoji: Record<string, string> = {
  happy: '😊', calm: '😌', sad: '😢', angry: '😤', tired: '😴',
}

const moodLabel: Record<string, string> = {
  happy: '开心', calm: '平静', sad: '难过', angry: '烦躁', tired: '疲惫',
}

const moodChipColor: Record<string, string> = {
  happy: 'bg-warning-soft text-warning',
  calm: 'bg-accent-soft text-accent',
  sad: 'bg-primary-soft text-primary',
  angry: 'bg-secondary-soft text-secondary',
  tired: 'bg-gray-100 dark:bg-gray-800 text-text-secondary',
}

export default function DiaryEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { diaries, addDiary, updateDiary, deleteDiary } = useDiaryStore()

  const existing = id ? diaries.find((d) => d.id === id) : undefined
  const isNew = !id

  const [isEditing, setIsEditing] = useState(isNew)
  const [date, setDate] = useState(existing?.date ?? dayjs().format('YYYY-MM-DD'))
  const [content, setContent] = useState(existing?.content ?? '')
  const [mood, setMood] = useState<Diary['mood']>(existing?.mood ?? 'calm')
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const { showMessage } = useMessage() // fix: unified showMessage

  const showToast = (msg: string) => showMessage('success', msg) // fix: delegate to global

  useEffect(() => {
    if (id && !existing) navigate('/diary', { replace: true })
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
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSave = () => {
    const trimmed = content.replace(/<[^>]*>/g, '').trim()
    if (!trimmed) return
    if (existing) {
      updateDiary(existing.id, { date, content, mood, tags })
      setIsEditing(false)
      showToast('日记已保存')
    } else {
      addDiary({ date, content, mood, tags })
      showToast('日记添加成功') // fix: add diary toast
      navigate('/diary')
    }
  }

  const handleCancel = () => {
    if (existing) {
      // Reset to saved values
      setDate(existing.date)
      setContent(existing.content)
      setMood(existing.mood)
      setTags(existing.tags ?? [])
      setTagInput('')
      setIsEditing(false)
    } else {
      navigate('/diary')
    }
  }

  const handleDelete = () => {
    if (existing) {
      deleteDiary(existing.id)
      showToast('日记已删除') // fix: delete diary toast
      navigate('/diary')
    }
  }

  // ─── Read Mode ───
  if (!isEditing && existing) {
    const dateObj = dayjs(existing.date)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']

    return (
      <div className="p-5 pb-24 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/diary')}
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

        {/* Date */}
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark font-medium mb-3">
          {dateObj.format('YYYY年M月D日')} 星期{weekdays[dateObj.day()]}
        </p>

        {/* Mood */}
        <div className="mb-5">
          <span className={`chip ${moodChipColor[existing.mood]}`}>
            {moodEmoji[existing.mood]} {moodLabel[existing.mood]}
          </span>
        </div>

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
          写于 {dayjs(existing.createdAt).format('M/D HH:mm')}
          {existing.updatedAt !== existing.createdAt && (
            <> · 编辑于 {dayjs(existing.updatedAt).format('M/D HH:mm')}</>
          )}
        </p>

        {/* Delete */}
        <div className="mt-4">
          {showDelete ? (
            <div className="card p-4 border-danger/20 animate-scale-in">
              <p className="text-sm text-danger mb-3 font-medium">确定要删除这篇日记吗？</p>
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
              删除这篇日记
            </button>
          )}
        </div>

        {/* fix: toast now handled by global MessageProvider */}
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
        <h2 className="text-base font-bold">{existing ? '编辑日记' : '写日记'}</h2>
        <button
          onClick={handleSave}
          disabled={!content.replace(/<[^>]*>/g, '').trim()}
          className="btn-primary !px-5 !py-2 text-sm"
        >
          保存
        </button>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-1.5 block">日期</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />
      </div>

      {/* Mood */}
      <div className="mb-4">
        <label className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-2 block">今天的心情</label>
        <div className="flex gap-2">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-medium border-2 transition-all ${
                mood === m.value
                  ? m.color
                  : 'border-transparent bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <span className={`text-2xl transition-transform ${mood === m.value ? 'scale-110' : ''}`}>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
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
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addTagFromInput()
            }
          }}
          onBlur={addTagFromInput}
          placeholder="输入标签，回车添加"
          className="input"
        />
      </div>

      {/* Content */}
      <div className="flex-1 mb-4">
        <label className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium mb-1.5 block">内容</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="写下今天的故事..."
          autoFocus
          className="input !p-0 overflow-hidden min-h-[220px]"
        />
      </div>
    </div>
  )
}
