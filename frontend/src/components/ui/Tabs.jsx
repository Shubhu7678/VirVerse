import { useId, useRef } from 'react'

/**
 * Segmented tab control. Controlled: pass `value` and `onChange`.
 * items: [{ value, label, count? }]. Arrow keys / Home / End move between tabs.
 * Render the panel yourself and give it role="tabpanel" with aria-labelledby={`${id}-${value}`} if needed;
 * for plain filtering (list stays on the page) the tablist alone is enough.
 */
export default function Tabs({ items, value, onChange, label, className = '' }) {
  const id = useId()
  const refs = useRef({})

  const onKeyDown = (e) => {
    const index = items.findIndex((item) => item.value === value)
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % items.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    else return
    e.preventDefault()
    onChange(items[next].value)
    refs.current[items[next].value]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`inline-flex max-w-full gap-1 overflow-x-auto rounded-control bg-surface-2 p-1 ${className}`}
    >
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[item.value] = node
            }}
            id={`${id}-${item.value}`}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors ${
              selected ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {item.label}
            {item.count !== undefined && <span className="text-xs text-fg-subtle tabular-nums">{item.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
