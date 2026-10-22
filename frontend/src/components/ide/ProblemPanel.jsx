import { useState } from 'react'
import { DifficultyBadge, StatusBadge } from '../Badges'
import { fetchTaskSolution } from '../../api/tasks'
import { getErrorMessage } from '../../api/client'

function CodeBlock({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-sm text-slate-100">
        {children || '(none)'}
      </pre>
    </div>
  )
}

function WorkedSolution({ solution }) {
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
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <span className="text-xs font-semibold text-slate-200">Worked C solution</span>
        <span className="rounded-md bg-slate-800 px-2 py-1 font-mono text-[10px] font-semibold text-slate-400">C</span>
      </div>
      <pre className="max-h-96 overflow-auto p-4 text-sm leading-6 text-slate-100">
        <code>{solution.solution}</code>
      </pre>
      <div className="border-t border-slate-800 bg-slate-900 px-4 py-3">
        <p className="mb-2 text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">Commented walkthrough</p>
        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-5 text-slate-400">
          {commentLines.map((line) => `// ${line}`).join('\n')}
        </pre>
      </div>
    </div>
  )
}

// Renders `inline code` segments from the plain-text description.
function Description({ text }) {
  return text.split('\n').map((line, i) => (
    <p key={i} className={line ? 'mb-3 text-slate-700' : ''}>
      {line.split(/(`[^`]+`)/g).map((part, j) =>
        part.startsWith('`') ? (
          <code key={j} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-brand-700">
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

  return (
    <div className="space-y-6 p-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{task.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <DifficultyBadge level={task.difficulty} />
          <StatusBadge status={status} />
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-semibold">Problem</h2>
        <Description text={task.description} />
      </section>

      {task.hint && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <button
            type="button"
            onClick={() => setHintOpen((open) => !open)}
            aria-expanded={hintOpen}
            className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">💡</span>
              Need a hint?
            </span>
            <span aria-hidden="true" className="text-xs">{hintOpen ? 'Hide' : 'Show'}</span>
          </button>
          {hintOpen && (
            <div className="mt-3 border-t border-amber-200 pt-3 text-sm leading-relaxed text-slate-700 dark:border-amber-900 dark:text-slate-300">
              <Description text={task.hint} />
              {task.solutionAvailable && (
                <div className="mt-4 border-t border-amber-200/80 pt-3 dark:border-amber-900">
                  <button
                    type="button"
                    onClick={toggleSolution}
                    aria-expanded={solutionOpen}
                    className="text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition hover:text-brand-600 dark:text-brand-600"
                  >
                    {solutionOpen ? 'Hide worked answer' : 'Still stuck? Show worked answer'}
                  </button>
                  {solutionOpen && (
                    <div className="mt-3 space-y-3">
                      {solutionLoading && <p role="status" className="text-sm text-slate-500">Loading worked answer…</p>}
                      {solutionError && <p role="alert" className="text-sm text-red-600">{solutionError}</p>}
                      {solution && <WorkedSolution solution={solution} />}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <CodeBlock label="Example input">{task.exampleInput}</CodeBlock>
        <CodeBlock label="Expected output">{task.exampleOutput}</CodeBlock>
      </section>

      {task.constraints.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Constraints</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {task.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-1 font-semibold">Sample test cases</h2>
        <p className="mb-3 text-sm text-slate-500">
          Submissions are also checked against {task.hiddenTestCount} hidden test case
          {task.hiddenTestCount === 1 ? '' : 's'}.
        </p>
        <div className="space-y-4">
          {task.sampleTests.map((tc, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <CodeBlock label={`Case ${i + 1} input`}>{tc.input}</CodeBlock>
              <CodeBlock label={`Case ${i + 1} output`}>{tc.expectedOutput}</CodeBlock>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
