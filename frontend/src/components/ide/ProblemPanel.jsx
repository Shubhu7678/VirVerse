import { DifficultyBadge, StatusBadge } from '../Badges'

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
