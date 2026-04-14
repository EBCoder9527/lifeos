import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDiaryStore } from '../../stores/diary'
import dayjs from 'dayjs'
import type { Diary } from '../../types'

const moods: { value: Diary['mood']; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'calm', emoji: '😌', label: '平静' },
  { value: 'sad', emoji: '😢', label: '难过' },
  { value: 'angry', emoji: '😤', label: '烦躁' },
  { value: 'tired', emoji: '😴', label: '疲惫' },
]

export default function DiaryEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { diaries, addDiary, updateDiary, deleteDiary } = useDiaryStore()

  const existing = id ? diaries.find((d) => d.id === id) : undefined
  const isEdit = !!existing

  const [date, setDate] = useState(existing?.date ?? dayjs().format('YYYY-MM-DD'))
  const [content, setContent] = useState(existing?.content ?? '')
  const [mood, setMood] = useState<Diary['mood']>(existing?.mood ?? 'calm')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (id && !existing) {
      navigate('/diary', { replace: true })
    }
  }, [id, existing, navigate])

  const handleSave = () => {
    const trimmed = content.trim()
    if (!trimmed) return

    if (isEdit) {
      updateDiary(existing.id, { content: trimmed, mood })
    } else {
      addDiary({ date, content: trimmed, mood })
    }
    navigate('/diary')
  }

  const handleDelete = () => {
    if (existing) {
      deleteDiary(existing.id)
      navigate('/diary')
    }
  }

  return (
    <div className="p-4 flex flex-col min-h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/diary')}
          className="text-blue-600 dark:text-blue-400 text-sm"
        >
          ← 返回
        </button>
        <h2 className="text-lg font-bold">{isEdit ? '编辑日记' : '写日记'}</h2>
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 disabled:text-gray-300 dark:disabled:text-gray-600"
        >
          保存
        </button>
      </div>

      {/* 日期 */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={isEdit}
        className="w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm mb-3 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
      />

      {/* 心情选择 */}
      <div className="flex gap-2 mb-3">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => setMood(m.value)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all ${
              mood === m.value
                ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400'
                : 'bg-white dark:bg-gray-800 border-2 border-transparent'
            }`}
          >
            <span className="text-xl">{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* 内容 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今天发生了什么..."
        autoFocus
        className="flex-1 w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm resize-none border border-gray-200 dark:border-gray-700 placeholder:text-gray-400 min-h-[200px]"
      />

      {/* 删除 */}
      {isEdit && (
        <div className="mt-4">
          {showDelete ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-medium"
              >
                确认删除
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-3 text-sm"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDelete(true)}
              className="w-full text-red-500 text-sm py-2"
            >
              删除这篇日记
            </button>
          )}
        </div>
      )}
    </div>
  )
}
