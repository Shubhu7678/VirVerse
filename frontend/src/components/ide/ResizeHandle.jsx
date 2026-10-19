import { useRef } from 'react'

// A draggable divider. Reports the pointer position as a 0-1 ratio of the container.
export default function ResizeHandle({ direction, containerRef, onChange }) {
  const dragging = useRef(false)
  const horizontal = direction === 'horizontal'

  const move = (e) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    onChange(horizontal ? (e.clientX - rect.left) / rect.width : (rect.bottom - e.clientY) / rect.height)
  }

  return (
    <div
      role="separator"
      aria-orientation={horizontal ? 'vertical' : 'horizontal'}
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        document.body.style.userSelect = 'none'
      }}
      onPointerMove={move}
      onPointerUp={() => {
        dragging.current = false
        document.body.style.userSelect = ''
      }}
      className={`group hidden shrink-0 touch-none bg-slate-200 transition-colors hover:bg-brand-500 active:bg-brand-500 lg:block ${
        horizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
      }`}
    />
  )
}
