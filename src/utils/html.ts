/** 去除 HTML 标签，返回纯文本（用于预览摘要） */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}
