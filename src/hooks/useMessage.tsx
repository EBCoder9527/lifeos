// fix: unified showMessage(type, text) — replaces per-page toast implementations
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type MessageType = 'success' | 'error' | 'info'

interface MessageContextValue {
  showMessage: (type: MessageType, text: string) => void
}

const MessageContext = createContext<MessageContextValue | null>(null)

const iconMap: Record<MessageType, { color: string; borderColor: string; path: string }> = {
  success: {
    color: 'var(--color-success)',
    borderColor: 'border-success/30',
    path: 'M20 6L9 17l-5-5',
  },
  error: {
    color: 'var(--color-danger)',
    borderColor: 'border-danger/30',
    path: 'M18 6L6 18M6 6l12 12',
  },
  info: {
    color: 'var(--color-primary)',
    borderColor: 'border-primary/30',
    path: 'M12 16v-4M12 8h.01',
  },
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ type: MessageType; text: string } | null>(null)

  const showMessage = useCallback((type: MessageType, text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 2000)
  }, [])

  const icon = msg ? iconMap[msg.type] : null

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      {msg && icon && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface dark:bg-surface-dark border ${icon.borderColor} shadow-lg animate-fade-in`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={icon.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon.path} />
          </svg>
          <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{msg.text}</span>
        </div>
      )}
    </MessageContext.Provider>
  )
}

export function useMessage() {
  const ctx = useContext(MessageContext)
  if (!ctx) throw new Error('useMessage must be used within MessageProvider')
  return ctx
}
