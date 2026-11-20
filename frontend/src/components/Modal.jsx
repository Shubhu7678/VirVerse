import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'

export default function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement
    const first = dialog.querySelector(FOCUSABLE)
    ;(first || dialog).focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = [...dialog.querySelectorAll(FOCUSABLE)]
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="animate-pop relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-pop outline-none"
      >
        <h2 className="mb-4 text-lg font-semibold text-fg">{title}</h2>
        {children}
      </div>
    </div>
  )
}
