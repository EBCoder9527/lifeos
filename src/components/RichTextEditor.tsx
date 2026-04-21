import { useRef, useCallback, useEffect, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

/**
 * 轻量富文本编辑器 — 基于 contentEditable + execCommand
 * 支持：段落、加粗、无序列表、有序列表
 */
export function RichTextEditor({ value, onChange, placeholder, autoFocus, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)

  // 初始化内容（仅首次或外部 value 完全变化时）
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    // 纯文本兼容：如果不含 HTML 标签，将换行转成 <p>
    if (el.innerHTML !== value) {
      el.innerHTML = isHtml(value) ? value : plainToHtml(value)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        const el = editorRef.current
        if (el) {
          el.focus()
          // 将光标移到末尾
          const range = document.createRange()
          range.selectNodeContents(el)
          range.collapse(false)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      }, 100)
    }
  }, [autoFocus])

  const handleInput = useCallback(() => {
    if (isComposing.current) return
    const el = editorRef.current
    if (el) onChange(el.innerHTML)
  }, [onChange])

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    // 触发 onChange
    const el = editorRef.current
    if (el) onChange(el.innerHTML)
  }, [onChange])

  const isActive = useCallback((cmd: string) => {
    try { return document.queryCommandState(cmd) } catch { return false }
  }, [])

  // 强制更新工具栏 active 状态
  const [, forceUpdate] = useState(0)
  const triggerUpdate = useCallback(() => {
    forceUpdate((n) => n + 1)
  }, [])

  return (
    <div className={className}>
      {/* 工具栏 */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-cream dark:bg-cream-dark rounded-t-xl sticky top-0 z-10">
        <ToolBtn
          label="B"
          active={isActive('bold')}
          onClick={() => exec('bold')}
          className="font-bold"
        />
        <ToolBtn
          label="UL"
          active={isActive('insertUnorderedList')}
          onClick={() => exec('insertUnorderedList')}
        />
        <ToolBtn
          label="OL"
          active={isActive('insertOrderedList')}
          onClick={() => exec('insertOrderedList')}
        />
      </div>
      {/* 编辑区 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="rich-editor-content min-h-[200px] px-4 py-3 outline-none text-[15px] leading-relaxed"
        onInput={handleInput}
        onCompositionStart={() => { isComposing.current = true }}
        onCompositionEnd={() => {
          isComposing.current = false
          handleInput()
        }}
        onKeyUp={triggerUpdate}
        onMouseUp={triggerUpdate}
        data-placeholder={placeholder}
      />
    </div>
  )
}

function ToolBtn({ label, active, onClick, className }: {
  label: string
  active: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${className ?? ''} ${
        active
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  )
}

/** 判断是否为 HTML 内容 */
function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str)
}

/** 纯文本转 HTML 段落 */
function plainToHtml(text: string): string {
  if (!text.trim()) return ''
  return text
    .split('\n')
    .map((line) => `<p>${line || '<br>'}</p>`)
    .join('')
}
