import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { downloadBackup, importData } from '../../db/backup'

const LAST_BACKUP_KEY = 'dayflow_last_backup_at'

export default function BackupPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [exporting, setExporting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY)
  const lastBackupText = lastBackup
    ? new Date(Number(lastBackup)).toLocaleString('zh-CN')
    : '暂无备份记录'

  // ── 导出 ──
  const handleExport = async () => {
    setExporting(true)
    setMessage(null)
    try {
      await downloadBackup()
      localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString())
      setMessage({ type: 'success', text: '备份文件已下载' })
    } catch (err) {
      setMessage({ type: 'error', text: `导出失败：${(err as Error).message}` })
    } finally {
      setExporting(false)
    }
  }

  // ── 导入：选文件 → 确认 ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setShowConfirm(true)
    setMessage(null)
    // 重置 input，以便同名文件可再次选择
    e.target.value = ''
  }

  const handleImportConfirm = async () => {
    if (!pendingFile) return
    setShowConfirm(false)
    setImporting(true)
    setMessage(null)
    try {
      const result = await importData(pendingFile)
      const total = Object.values(result.counts).reduce((a, b) => a + b, 0)
      // 短暂显示成功提示后刷新页面，让 Zustand 从 localStorage 重新水合
      setMessage({ type: 'success', text: `导入成功，共 ${total} 条记录，即将刷新...` })
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setMessage({ type: 'error', text: `导入失败：${(err as Error).message}` })
      setImporting(false)
      setPendingFile(null)
    }
  }

  const handleImportCancel = () => {
    setShowConfirm(false)
    setPendingFile(null)
  }

  return (
    <div className="p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-primary text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <h2 className="text-base font-bold">数据与备份</h2>
        <div className="w-10" />
      </div>

      {/* 上次备份时间 */}
      <div className="card p-5 mb-4">
        <p className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark mb-1">上次备份</p>
        <p className="text-sm">{lastBackupText}</p>
      </div>

      {/* 导出备份 */}
      <div className="card mb-4 overflow-hidden">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-sm font-medium block">导出备份</span>
            <span className="text-[11px] text-text-tertiary">下载 JSON 格式备份文件</span>
          </div>
        </button>
      </div>

      {/* 导入备份 */}
      <div className="card mb-4 overflow-hidden">
        {showConfirm ? (
          <div className="p-4 animate-scale-in">
            <p className="text-sm text-danger mb-1 font-medium">
              确认导入备份？
            </p>
            <p className="text-xs text-text-tertiary mb-3">
              导入将覆盖当前所有数据，此操作不可撤销。建议先导出当前数据作为备份。
            </p>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-3">
              文件：{pendingFile?.name}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleImportConfirm}
                className="flex-1 bg-danger text-white rounded-xl py-2.5 text-sm font-medium"
              >
                确认导入
              </button>
              <button
                onClick={handleImportCancel}
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 text-sm font-medium"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-success">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-left">
              <span className="text-sm font-medium block">
                {importing ? '导入中...' : '导入备份'}
              </span>
              <span className="text-[11px] text-text-tertiary">从 JSON 文件恢复数据</span>
            </div>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 操作反馈 */}
      {message && (
        <div
          className={`card p-4 mb-4 animate-scale-in ${
            message.type === 'success'
              ? 'bg-success-soft text-success'
              : 'bg-danger/10 text-danger'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* 说明 */}
      <div className="card p-5">
        <p className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark mb-2">说明</p>
        <ul className="text-xs text-text-tertiary space-y-1.5">
          <li>备份文件包含所有模块数据（日记、习惯、灵感、计划、日程、设置）</li>
          <li>导入会覆盖当前数据，请提前备份</li>
          <li>支持跨版本导入，旧备份会自动升级</li>
        </ul>
      </div>
    </div>
  )
}
