import { useEffect, useId, useRef, useState } from 'react'

/**
 * Menu button. `trigger` is a render function: ({ open, props }) => node, where `props` must be spread
 * onto the trigger button. `children` is a render function: ({ close }) => menu content.
 * Closes on outside click, Escape and (via `close`) item selection.
 */
export default function Dropdown({ trigger, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        rootRef.current?.querySelector('[aria-haspopup]')?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {trigger({
        open,
        props: {
          type: 'button',
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': open ? menuId : undefined,
          onClick: () => setOpen((current) => !current),
        },
      })}
      {open && (
        <div
          id={menuId}
          role="menu"
          className={`animate-pop absolute top-full z-40 mt-2 min-w-48 rounded-card border border-line bg-surface p-1 shadow-pop ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ className = '', ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-2 ${className}`}
      {...props}
    />
  )
}
