import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const tones = {
  info: { icon: Info, color: 'text-accent-text' },
  success: { icon: CircleCheck, color: 'text-success' },
  error: { icon: CircleAlert, color: 'text-danger' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (message, { tone = 'info', duration = 4000 } = {}) => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-3), { id, message, tone }])
      if (duration) timers.current.set(id, setTimeout(() => dismiss(id), duration))
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const active = timers.current
    return () => active.forEach((timer) => clearTimeout(timer))
  }, [])

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => {
          const { icon: Glyph, color } = tones[toast.tone] || tones.info
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className="animate-toast pointer-events-auto flex items-start gap-3 rounded-card border border-line bg-surface p-3 text-sm text-fg shadow-pop"
            >
              <Glyph className={`mt-0.5 size-4 shrink-0 ${color}`} aria-hidden="true" />
              <p className="min-w-0 flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-fg-subtle transition-colors hover:text-fg"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
