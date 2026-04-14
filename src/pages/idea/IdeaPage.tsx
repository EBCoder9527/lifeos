import { useState, useRef } from 'react'
import { useIdeaStore } from '../../stores/idea'
import dayjs from 'dayjs'

export default function IdeaPage() {
  const { ideas, addIdea, deleteIdea } = useIdeaStore()
  const [showInput, setShowInput] = useState(false)
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    const tags = tagInput
      .split(/[,，\s]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean)
    addIdea(trimmed, tags)
    setContent('')
    setTagInput('')
    setShowInput(false)
  }

  const handleOpen = () => {
    setShowInput(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">灵感</h2>
        <button
          onClick={handleOpen}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full font-medium"
        >
          + 记录
        </button>
      </div>

      {/* 快速输入弹层 */}
      {showInput && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl p-4 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">记录灵感</h3>
              <button
                onClick={() => setShowInput(false)}
                className="text-gray-400 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="脑中闪过了什么..."
              rows={3}
              className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm resize-none border border-gray-200 dark:border-gray-600 placeholder:text-gray-400 mb-2"
            />
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="标签（用空格或逗号分隔，可选）"
              className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 placeholder:text-gray-400 mb-3"
            />
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-600 py-20">
          <p className="text-4xl mb-3">💡</p>
          <p>还没有灵感</p>
          <p className="text-sm mt-1">记录脑中闪过的想法</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
            >
              <p className="text-sm whitespace-pre-wrap">{idea.content}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1.5 flex-wrap">
                  {idea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                  {dayjs(idea.createdAt).format('M/D HH:mm')}
                </span>
              </div>
              {/* 删除 */}
              <div className="mt-2 flex justify-end">
                {deleteId === idea.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        deleteIdea(idea.id)
                        setDeleteId(null)
                      }}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded-full"
                    >
                      确认删除
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteId(idea.id)}
                    className="text-xs text-gray-400"
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
