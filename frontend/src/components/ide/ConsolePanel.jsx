import { useEffect, useRef, useState } from 'react'
import Spinner from '../Spinner'
import { getHint } from '../../utils/diagnostics'

const tabs = [
  { id: 'input', label: 'Input' },
  { id: 'output', label: 'Output' },
  { id: 'tests', label: 'Test Results' },
]

const good = 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
const bad = 'bg-red-50 text-red-700 ring-red-600/20'
const warn = 'bg-amber-50 text-amber-700 ring-amber-600/20'

const verdictStyle = {
  Success: good,
  Accepted: good,
  Passed: good,
  'Wrong Answer': bad,
  'Compilation Error': bad,
  'Runtime Error': bad,
  'Time Limit Exceeded': warn,
  'Output Limit Exceeded': warn,
  'Memory Limit Exceeded': warn,
}

function Verdict({ label }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        verdictStyle[label] || warn
      }`}
    >
      {label === 'Success' ? 'Ran successfully' : label}
    </span>
  )
}

function Pre({ label, children, tone = 'text-slate-100' }) {
  return (
    <div>
      {label && <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>}
      <pre className={`max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-sm whitespace-pre-wrap ${tone}`}>
        {children || ' '}
      </pre>
    </div>
  )
}

function Hint({ children }) {
  if (!children) return null
  return <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">💡 {children}</p>
}

function OutputTab({ running, runError, result }) {
  if (running) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner className="size-4 text-brand-600" /> Compiling and running…
      </div>
    )
  }
  if (runError) return <p role="alert" className="text-sm text-red-600">{runError}</p>
  if (!result) return <p className="text-sm text-slate-500">Click “Run Code” to see your program’s output here.</p>

  const failed = result.status !== 'Success'
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Verdict label={result.status} />
        {result.timeMs != null && <span className="text-xs text-slate-500">{result.timeMs} ms</span>}
        {result.exitCode != null && <span className="text-xs text-slate-500">exit code {result.exitCode}</span>}
      </div>
      {failed && <Hint>{getHint(result)}</Hint>}
      {result.compileOutput && (
        <Pre label={result.status === 'Compilation Error' ? 'Compiler errors' : 'Compiler warnings'} tone={result.status === 'Compilation Error' ? 'text-red-300' : 'text-amber-300'}>
          {result.compileOutput}
        </Pre>
      )}
      {result.status !== 'Compilation Error' && <Pre label="Output">{result.stdout}</Pre>}
      {result.stderr && <Pre label="Error output" tone="text-red-300">{result.stderr}</Pre>}
    </div>
  )
}

function TestsTab({ submitting, submitError, submission }) {
  if (submitting) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner className="size-4 text-brand-600" /> Running your code against the test cases…
      </div>
    )
  }
  if (submitError) return <p role="alert" className="text-sm text-red-600">{submitError}</p>
  if (!submission) return <p className="text-sm text-slate-500">Click “Submit” to check your solution against all test cases.</p>

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Verdict label={submission.status} />
        {submission.status !== 'Compilation Error' && (
          <span className="text-sm text-slate-600">
            {submission.passedCount}/{submission.totalCount} test cases passed
          </span>
        )}
      </div>
      {submission.status === 'Accepted' && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">🎉 All test cases passed. Task completed!</p>
      )}
      {submission.status !== 'Accepted' && <Hint>{getHint({ status: submission.status, compileOutput: submission.compileOutput })}</Hint>}
      {submission.compileOutput && <Pre label="Compiler errors" tone="text-red-300">{submission.compileOutput}</Pre>}

      <ul className="space-y-2">
        {submission.results.map((r) => (
          <li key={r.index} className="rounded-lg border border-slate-200 bg-white">
            <details open={!r.passed && !r.hidden}>
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="font-medium">
                  Test case {r.index} {r.hidden && <span className="font-normal text-slate-400">(hidden)</span>}
                </span>
                <Verdict label={r.status} />
              </summary>
              {!r.hidden && (
                <div className="grid gap-3 border-t border-slate-100 p-3 sm:grid-cols-3">
                  <Pre label="Input">{r.input}</Pre>
                  <Pre label="Expected">{r.expectedOutput}</Pre>
                  <Pre label="Your output" tone={r.passed ? 'text-emerald-300' : 'text-red-300'}>{r.actualOutput}</Pre>
                  {r.stderr && <div className="sm:col-span-3"><Pre label="Error output" tone="text-red-300">{r.stderr}</Pre></div>}
                </div>
              )}
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TerminalTab({ run, events, sendInput }) {
  const [input, setInput] = useState('')
  const transcriptRef = useRef(null)

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [events])

  const submitInput = (event) => {
    event.preventDefault()
    if (!input.trim() && input.length === 0) return
    if (sendInput(input)) setInput('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${run.running ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'}`} />
          <span className="text-xs font-medium text-slate-300">Interactive terminal</span>
        </div>
        <span className="text-[11px] text-slate-500">
          {run.running ? run.ready ? 'Program is running' : 'Compiling…' : 'Ready'}
        </span>
      </div>
      <div ref={transcriptRef} role="log" aria-live="polite" className="min-h-0 flex-1 overflow-auto p-4 font-mono text-sm leading-6">
        {run.result?.status === 'Compilation Error' && run.result.compileOutput && (
          <pre className="mb-3 whitespace-pre-wrap text-red-300">{run.result.compileOutput}</pre>
        )}
        {events?.map((item, index) => (
          <span key={index} className={item.stream === 'stderr' ? 'whitespace-pre-wrap text-red-300' : 'whitespace-pre-wrap text-emerald-100'}>
            {item.data}
          </span>
        ))}
        {!events?.length && !run.runError && (
          <p className="text-slate-500">
            {run.running ? 'Your program is starting…' : 'Run your program. Any printf prompts will appear here; enter values below when requested.'}
          </p>
        )}
        {run.runError && <p role="alert" className="mt-2 whitespace-pre-wrap text-red-300">{run.runError}</p>}
        {!run.running && run.result && (
          <p className={`mt-3 text-xs ${run.result.status === 'Success' ? 'text-emerald-400' : 'text-amber-300'}`}>
            Process finished · {run.result.status}
            {run.result.timeMs != null ? ` · ${run.result.timeMs} ms` : ''}
          </p>
        )}
      </div>
      <form onSubmit={submitInput} className="flex items-center gap-2 border-t border-white/10 bg-white/[0.03] p-3">
        <span aria-hidden="true" className="font-mono text-emerald-400">&gt;</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={!run.running || !run.ready}
          aria-label="Program input"
          placeholder={run.running ? 'Type a value and press Enter' : 'Run your program to enter input'}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!run.running || !run.ready || !input.length}
          className="rounded-lg bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default function ConsolePanel({
  tab, setTab, stdin, setStdin, run, test, showTests = true, interactive = false, sendInput,
}) {
  const visibleTabs = interactive
    ? [{ id: 'terminal', label: 'Terminal' }, { id: 'output', label: 'Run details' }]
    : showTests ? tabs : tabs.filter((t) => t.id !== 'tests')
  return (
    <div className="flex h-full flex-col bg-white">
      <div role="tablist" className="flex shrink-0 border-b border-slate-200 px-2">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {interactive && tab === 'terminal' && <TerminalTab run={run} events={run.events} sendInput={sendInput} />}
        {!interactive && tab === 'input' && (
          <div className="flex h-full flex-col">
            <label htmlFor="stdin" className="mb-1.5 text-sm text-slate-600">
              Standard input (stdin) given to your program when you click Run Code:
            </label>
            <textarea
              id="stdin"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="e.g. 5"
              spellCheck={false}
              className="min-h-24 w-full flex-1 resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        )}
        {tab === 'output' && <OutputTab {...run} />}
        {tab === 'tests' && showTests && <TestsTab {...test} />}
      </div>
    </div>
  )
}
