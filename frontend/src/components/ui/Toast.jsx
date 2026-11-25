import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const tones = {
  info: { icon: Info, color: 'text-accent-text', bar: 'bg-accent' },
  success: { icon: CircleCheck, color: 'text-success', bar: 'bg-success' },
  error: { icon: CircleAlert, color: 'text-danger', bar: 'bg-danger' },
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
    (message, { tone = 'info', duration = tone === 'error' ? 6000 : 3200 } = {}) => {
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

  const success = useCallback((message) => show(message, { tone: 'success' }), [show])
  const error = useCallback((message) => show(message, { tone: 'error' }), [show])
  const value = useMemo(() => ({ show, success, error, dismiss }), [show, success, error, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed top-16 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => {
          const { icon: Glyph, color, bar } = tones[toast.tone] || tones.info
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className="animate-toast pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-card border border-line bg-surface py-3 pr-3 pl-4 text-sm font-medium text-fg shadow-pop"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} aria-hidden="true" />
              <Glyph className={`size-[18px] shrink-0 ${color}`} aria-hidden="true" />
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
