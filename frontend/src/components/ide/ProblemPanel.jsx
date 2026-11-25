import { useRef, useState } from 'react'
import { DifficultyBadge, StatusBadge } from '../Badges'
import { fetchTaskSolution } from '../../api/tasks'
import { getErrorMessage } from '../../api/client'
import { Lightbulb } from 'lucide-react'
import Icon, { icons } from '../Icon'
import DocumentationDrawer from './DocumentationDrawer'
import { Link } from 'react-router-dom'

function CodeBlock({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-fg-muted">{label}</p>
      <pre className="overflow-x-auto rounded-control border border-line bg-bg p-3 font-mono text-sm text-fg">
        {children || '(none)'}
      </pre>
    </div>
  )
}

function WorkedSolution({ solution, language }) {
  const isLanguageSolution = language !== 'c'
  const commentLines = solution.notes.split('\n').flatMap((paragraph) => {
    const words = paragraph.split(/\s+/)
    const lines = []
    let line = ''
    for (const word of words) {
      if (line && `${line} ${word}`.length > 76) {
        lines.push(line)
        line = word
      } else {
        line = line ? `${line} ${word}` : word
      }
    }
    if (line) lines.push(line)
    return lines
  })

  return (
    <div className="overflow-hidden rounded-card border border-line bg-bg">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="text-xs font-medium text-fg">
          {isLanguageSolution
            ? `Guided ${language === 'javascript' ? 'JavaScript' : 'Python'} solution`
            : 'Worked C solution'}
        </span>
        <span className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-fg-muted">
          {language === 'javascript' ? 'JS' : language === 'python' ? 'Py' : 'C'}
        </span>
      </div>
      {solution.solution && (
        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 text-xs font-medium text-fg-muted">
            {isLanguageSolution ? 'Solution code' : 'Complete solution'}
          </p>
          <pre className="max-h-96 overflow-auto rounded-control bg-surface-2 p-3 font-mono text-sm leading-6 text-fg">
            <code>{solution.solution}</code>
          </pre>
        </div>
      )}
      <div className="border-t border-line bg-surface px-4 py-3">
        <p className="mb-2 text-xs font-medium text-fg-muted">
          {isLanguageSolution ? 'Solution walkthrough' : 'Commented walkthrough'}
        </p>
        {isLanguageSolution ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-fg-muted">{solution.notes}</p>
        ) : (
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-5 text-fg-muted">
            {commentLines.map((line) => `// ${line}`).join('\n')}
          </pre>
        )}
      </div>
    </div>
  )
}

// Renders `inline code` segments from the plain-text description.
function Description({ text }) {
  return text.split('\n').map((line, i) => (
    <p key={i} className={line ? 'mb-3 text-fg' : ''}>
      {line.split(/(`[^`]+`)/g).map((part, j) =>
        part.startsWith('`') ? (
          <code key={j} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-accent-text">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </p>
  ))
}

export default function ProblemPanel({ task, status }) {
  const [hintOpen, setHintOpen] = useState(false)
  const [solutionOpen, setSolutionOpen] = useState(false)
  const [solutionLoading, setSolutionLoading] = useState(false)
  const [solutionError, setSolutionError] = useState('')
  const [solution, setSolution] = useState(null)
  const [docsOpen, setDocsOpen] = useState(false)
  const docsTriggerRef = useRef(null)

  const toggleSolution = async () => {
    if (solutionOpen) {
      setSolutionOpen(false)
      return
    }
    setSolutionOpen(true)
    if (solution) return

    setSolutionLoading(true)
    setSolutionError('')
    try {
      setSolution(await fetchTaskSolution(task.slug))
    } catch (error) {
      setSolutionError(getErrorMessage(error, 'Could not load the worked solution'))
    } finally {
      setSolutionLoading(false)
    }
  }

  const guideLesson = task.guide

  return (
    <div className="space-y-6 p-5 text-sm leading-relaxed">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-fg">{task.title}</h2>
          <button
            ref={docsTriggerRef}
            type="button"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border border-line-strong px-2.5 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            onClick={() => setDocsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={docsOpen}
            aria-controls="documentation-drawer"
          >
            <Icon d={icons.bookOpen} className="size-4" />
            <span>Docs</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={task.difficulty} />
          <StatusBadge status={status} />
        </div>
        {guideLesson && (
          <Link to={`/python/guide/${guideLesson.slug}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-text hover:underline">
            New to this? Read lesson {guideLesson.n}: {guideLesson.title}
          </Link>
        )}
      </div>

      <section>
        <h3 className="mb-2 font-semibold text-fg">Problem</h3>
        <Description text={task.description} />
      </section>

      {task.hint && (
        <section className="rounded-card border border-line bg-surface-2 p-4">
          <button
            type="button"
            onClick={() => setHintOpen((open) => !open)}
            aria-expanded={hintOpen}
            className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-fg"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="size-4 text-accent-text" aria-hidden="true" />
              Need a hint?
            </span>
            <span aria-hidden="true" className="text-xs text-fg-muted">{hintOpen ? 'Hide' : 'Show'}</span>
          </button>
          {hintOpen && (
            <div className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-fg-muted">
              <Description text={task.hint} />
              {task.solutionAvailable && (
                <div className="mt-4 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={toggleSolution}
                    aria-expanded={solutionOpen}
                    className="text-sm font-medium text-accent-text underline underline-offset-4 hover:no-underline"
                  >
                    {solutionOpen
                      ? 'Hide solution'
                      : task.language === 'c'
                        ? 'Still stuck? Show worked answer'
                        : 'Still stuck? Show solution'}
                  </button>
                  {solutionOpen && (
                    <div className="mt-3 space-y-3">
                      {solutionLoading && <p role="status" className="text-sm text-fg-muted">Loading worked answer…</p>}
                      {solutionError && <p role="alert" className="text-sm text-danger">{solutionError}</p>}
                      {solution && <WorkedSolution solution={solution} language={task.language} />}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <CodeBlock label="Example input">{task.exampleInput}</CodeBlock>
        <CodeBlock label="Expected output">{task.exampleOutput}</CodeBlock>
      </section>

      {task.constraints.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold text-fg">Constraints</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {task.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-1 font-semibold text-fg">Sample test cases</h3>
        <p className="mb-3 text-sm text-fg-muted">
          Submissions are also checked against {task.hiddenTestCount} hidden test case
          {task.hiddenTestCount === 1 ? '' : 's'}.
        </p>
        <div className="space-y-4">
          {task.sampleTests.map((tc, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <CodeBlock label={`Case ${i + 1} input`}>{tc.input}</CodeBlock>
              <CodeBlock label={`Case ${i + 1} output`}>{tc.expectedOutput}</CodeBlock>
            </div>
          ))}
        </div>
      </section>

      <DocumentationDrawer
        task={task}
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        triggerRef={docsTriggerRef}
      />
    </div>
  )
}
