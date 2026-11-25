import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, X } from 'lucide-react'

const PAD = 8
const GAP = 16
const POPOVER_WIDTH = 360

function measure(target) {
  if (!target) return null
  const el = document.querySelector(target)
  if (!el) return null
  const r = el.getBoundingClientRect()
  // Hidden elements (for example the sidebar on small screens) have no size.
  if (r.width === 0 || r.height === 0) return null
  return { el, top: r.top, left: r.left, width: r.width, height: r.height }
}

// Places the card beside the highlighted element, then keeps it inside the viewport.
function place(rect, popHeight) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(POPOVER_WIDTH, vw - 32)
  if (!rect) return { width, top: Math.max((vh - popHeight) / 2, 16), left: (vw - width) / 2 }
  let left
  let top
  if (rect.left + rect.width + GAP + width + 16 <= vw) {
    left = rect.left + rect.width + PAD + GAP
    top = rect.top + rect.height / 2 - popHeight / 2
  } else {
    left = rect.left + rect.width - width
    top = rect.top + rect.height + PAD + GAP
  }
  return {
    width,
    left: Math.min(Math.max(left, 16), vw - width - 16),
    top: Math.min(Math.max(top, 16), vh - popHeight - 16),
  }
}

/**
 * Spotlight tour. `steps`: [{ target?: cssSelector, title, body }]. A step without a target
 * (or whose target is not on screen) is shown as a centred card.
 */
export default function ProductTour({ steps, open, onClose }) {
  const [index, setIndex] = useState(0)
  const [layout, setLayout] = useState({ rect: null, pop: null })
  const popRef = useRef(null)
  const nextRef = useRef(null)
  const step = steps[index]
  const last = index === steps.length - 1

  const finish = useCallback((completed) => {
    setIndex(0)
    onClose(completed)
  }, [onClose])

  const update = useCallback(() => {
    if (!open || !step) return
    const rect = measure(step.target)
    const popHeight = popRef.current?.offsetHeight ?? 260
    setLayout({ rect, pop: place(rect, popHeight) })
  }, [open, step])

  useEffect(() => {
    if (!open || !step) return undefined
    const found = measure(step.target)
    found?.el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const frame = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, step, update])

  useEffect(() => {
    if (!open) return undefined
    nextRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') finish(false)
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1))
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, steps.length, finish])

  if (!open || !step || typeof document === 'undefined') return null
  const { rect, pop } = layout

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="presentation">
      {/* Clicking the dimmed area does nothing, so a stray click cannot end the tour. */}
      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-xl border-2 border-accent transition-all duration-200"
          style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.62)' }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-black/60" />
      )}

      <div
        ref={popRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="fixed rounded-2xl border border-line-strong bg-surface p-6 shadow-pop"
        style={pop ? { top: pop.top, left: pop.left, width: pop.width } : { visibility: 'hidden' }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-text">Step {index + 1} of {steps.length}</p>
          <button type="button" onClick={() => finish(false)} aria-label="Close tour" className="-m-1 rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <h2 id="tour-title" className="mt-3 text-xl font-semibold tracking-tight text-fg">{step.title}</h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{step.body}</p>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.title} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-accent' : 'w-1.5 bg-line-strong'}`} />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          {last ? (
            <span />
          ) : (
            <button type="button" onClick={() => finish(false)} className="text-sm text-fg-muted transition-colors hover:text-fg">Skip tour</button>
          )}
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button type="button" onClick={() => setIndex(index - 1)} className="rounded-full px-4 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg">Back</button>
            )}
            <button
              ref={nextRef}
              type="button"
              onClick={() => (last ? finish(true) : setIndex(index + 1))}
              className="inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-cta-fg transition-colors hover:bg-cta-hover"
            >
              {last ? 'Finish' : 'Next'} {!last && <ArrowRight className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
