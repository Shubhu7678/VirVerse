import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon, { icons } from '../Icon'
import { getConceptsForTask, getLanguageLabel } from '../../data/programmingConcepts'
import ConceptSection from './ConceptSection'
import './documentation.css'

export default function DocumentationDrawer({ task, open, onClose, triggerRef }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const concepts = getConceptsForTask(task)
  const titleId = 'documentation-drawer-title'

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef?.current
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current?.()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      trigger?.focus()
    }
  }, [open, triggerRef])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`docs-layer ${open ? 'is-visible' : ''}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="docs-backdrop"
        aria-label="Close documentation"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        id="documentation-drawer"
        className="docs-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
      >
        <header className="docs-drawer-header">
          <div className="docs-drawer-title">
            <span className="docs-book-icon"><Icon d={icons.bookOpen} className="size-5" /></span>
            <div>
              <h2 id={titleId}>Documentation</h2>
              <p>Only what this problem needs</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="docs-close-button"
            onClick={onClose}
            aria-label="Close documentation"
          >
            <Icon d={icons.close} className="size-4" />
          </button>
        </header>

        <div className="docs-drawer-context">
          <span className="docs-language-badge">{getLanguageLabel(task.language)}</span>
          <div>
            <span className="docs-context-label">Question {task.questionOrder}</span>
            <h3>{task.title}</h3>
          </div>
        </div>

        <div className="docs-drawer-body">
          <div className="docs-concept-list">
            {concepts.map((concept, index) => (
              <ConceptSection
                key={concept.id}
                concept={{ ...concept, index: index + 1 }}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
