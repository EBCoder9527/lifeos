interface RichTextViewerProps {
  content: string
  className?: string
}

/**
 * 富文本 / 纯文本通用渲染组件。
 * - 含 HTML 标签 → 当 HTML 渲染
 * - 纯文本 → whitespace-pre-wrap 渲染（与旧版行为一致）
 */
export function RichTextViewer({ content, className }: RichTextViewerProps) {
  if (!content) {
    return <p className={`text-text-tertiary ${className ?? ''}`}>暂无内容</p>
  }

  if (isHtml(content)) {
    return (
      <div
        className={`rich-viewer-content ${className ?? ''}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // 纯文本兼容
  return (
    <div className={`whitespace-pre-wrap ${className ?? ''}`}>
      {content}
    </div>
  )
}

function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str)
}
