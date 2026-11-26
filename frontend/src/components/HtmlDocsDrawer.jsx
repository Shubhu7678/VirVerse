import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Check, ChevronDown, Copy, X } from 'lucide-react'
import { docsForTask } from '../data/htmlDocsMap'

const FOCUSABLE = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable: the code can still be selected by hand
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-xs text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

const TOKEN = /<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|&[a-zA-Z]+;/g
const ATTRIBUTE = /(\s+)([^\s=/>]+)(?:(=)("[^"]*"|'[^']*'|[^\s>]+))?/g

// Colours HTML so tags, attributes, values and comments can be told apart at a glance.
function highlightHtml(code) {
  const out = []
  let last = 0
  let key = 0
  for (const match of code.matchAll(TOKEN)) {
    if (match.index > last) out.push(code.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('<!')) {
      out.push(<span key={key++} className="text-fg-subtle">{token}</span>)
    } else if (token.startsWith('&')) {
      out.push(<span key={key++} className="text-pink-700 dark:text-pink-300">{token}</span>)
    } else {
      const parts = /^<(\/?)([\w-]+|!doctype)([\s\S]*?)(\/?)>$/i.exec(token)
      if (!parts) {
        out.push(token)
      } else {
        const [, slash, name, rest, selfClose] = parts
        out.push(<span key={key++} className="text-fg-subtle">{`<${slash}`}</span>)
        out.push(<span key={key++} className="text-sky-700 dark:text-sky-300">{name}</span>)
        let at = 0
        for (const attr of rest.matchAll(ATTRIBUTE)) {
          if (attr.index > at) out.push(rest.slice(at, attr.index))
          out.push(attr[1])
          out.push(<span key={key++} className="text-fg-muted">{attr[2]}</span>)
          if (attr[3]) {
            out.push(<span key={key++} className="text-fg-subtle">=</span>)
            out.push(<span key={key++} className="text-orange-700 dark:text-orange-300">{attr[4]}</span>)
          }
          at = attr.index + attr[0].length
        }
        if (at < rest.length) out.push(rest.slice(at))
        out.push(<span key={key++} className="text-fg-subtle">{`${selfClose}>`}</span>)
      }
    }
    last = match.index + token.length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

// A labelled code block. The Copy button sits in the label bar so it never covers the code.
function CodeBlock({ label, code }) {
  return (
    <figure className="overflow-hidden rounded-control border border-line">
      <figcaption className="flex h-8 items-center justify-between border-b border-line bg-surface-2 pr-1.5 pl-3">
        <span className="text-xs text-fg-subtle">{label}</span>
        <CopyButton text={code} />
      </figcaption>
      <pre className="overflow-x-auto bg-inset p-3 font-mono text-xs leading-relaxed whitespace-pre text-fg"><code>{highlightHtml(code)}</code></pre>
    </figure>
  )
}

function Concept({ concept }) {
  return (
    <article className="space-y-3">
      <h3 className="text-sm font-semibold text-fg">{concept.title}</h3>
      <p className="text-[13px] leading-relaxed text-fg-muted">{concept.explanation}</p>
      <CodeBlock label="Pattern" code={concept.syntax} />
      <CodeBlock label="Example" code={concept.example} />
      <div className="rounded-control bg-surface-2 px-3 py-2.5">
        <p className="text-xs text-fg-subtle">What you see</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-fg">{concept.result}</p>
      </div>
    </article>
  )
}

// A panel that slides in from the right with the basics of the lesson's topic.
export default function HtmlDocsDrawer({ task, open, onClose, triggerRef }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const { own, other } = docsForTask(task.id)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef?.current
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = [...(panelRef.current?.querySelectorAll(FOCUSABLE) ?? [])]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      trigger?.focus()
    }
  }, [open, triggerRef])

  return createPortal(
    <div className={`fixed inset-0 z-[100] transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close documentation"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 size-full cursor-default transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'var(--overlay)' }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="html-docs-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-pop transition-transform duration-300 ease-out sm:max-w-lg ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-control bg-surface-2 text-fg-muted">
              <BookOpen className="size-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="html-docs-title" className="text-sm font-semibold text-fg">Docs</h2>
              <p className="truncate text-xs text-fg-muted">{task.title}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close documentation"
            className="grid size-9 shrink-0 place-items-center rounded-control text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-5">
          <section aria-label="The basics" className="space-y-8">
            <p className="text-xs font-medium text-fg-subtle">The basics for this lesson</p>
            {own.map((concept) => <Concept key={concept.title} concept={concept} />)}
          </section>

          <section aria-label="More HTML reference">
            <p className="mb-2 text-xs font-medium text-fg-subtle">More HTML reference</p>
            <div className="divide-y divide-line overflow-hidden rounded-control border border-line">
              {other.map((concept) => (
                <details key={concept.title} className="group bg-surface">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-[13px] font-medium text-fg hover:bg-surface-2">
                    {concept.title}
                    <ChevronDown className="size-4 text-fg-subtle transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="px-3 pt-1 pb-4"><Concept concept={concept} /></div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
