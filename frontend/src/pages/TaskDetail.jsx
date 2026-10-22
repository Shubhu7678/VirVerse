import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchTask } from '../api/tasks'
import { runCode, submitSolution } from '../api/execute'
import { getErrorMessage } from '../api/client'
import useAsync from '../hooks/useAsync'
import { useTheme } from '../context/ThemeContext'
import { LoadingBlock, ErrorBlock } from '../components/States'
import Icon, { icons } from '../components/Icon'
import Button from '../components/Button'
import ProblemPanel from '../components/ide/ProblemPanel'
import CodeEditor from '../components/ide/CodeEditor'
import ConsolePanel from '../components/ide/ConsolePanel'
import ResizeHandle from '../components/ide/ResizeHandle'
import { rememberTask } from '../utils/lastTask'
import { useAuth } from '../context/AuthContext'

const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
const draftKey = (slug) => `virvese:draft:${slug}`
const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

function Workspace({ task, assignmentId }) {
  // Drafts are kept per task so code survives tab switches and page reloads.
  const [code, setCode] = useState(() => localStorage.getItem(draftKey(task.slug)) ?? task.starterCode)
  const [stdin, setStdin] = useState('')
  const [tab, setTab] = useState('input')
  const { theme, toggle: toggleTheme } = useTheme()
  const { updateGamification } = useAuth()

  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('virvese:editor-font')) || 14)
  const [wrap, setWrap] = useState(() => localStorage.getItem('virvese:editor-wrap') === '1')
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()

  useEffect(() => rememberTask(task.slug, task.title), [task.slug, task.title])
  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(() => setToast(''), 5000)
    return () => clearTimeout(id)
  }, [toast])

  const changeFont = (delta) =>
    setFontSize((f) => {
      const next = clamp(f + delta, 10, 24)
      localStorage.setItem('virvese:editor-font', String(next))
      return next
    })

  const toggleWrap = () =>
    setWrap((w) => {
      localStorage.setItem('virvese:editor-wrap', w ? '0' : '1')
      return !w
    })

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setToast('Could not copy. Select the code and press Ctrl/Cmd + C instead.')
    }
  }

  const [run, setRun] = useState({ running: false, runError: '', result: null })
  const [test, setTest] = useState({ submitting: false, submitError: '', submission: null })
  const [status, setStatus] = useState(task.status)
  const busyRef = useRef(false)

  const [split, setSplit] = useState(0.4)
  const [consoleSize, setConsoleSize] = useState(0.38)
  const layoutRef = useRef(null)
  const rightRef = useRef(null)

  const busy = run.running || test.submitting

  const updateCode = (value) => {
    setCode(value)
    localStorage.setItem(draftKey(task.slug), value)
  }

  const resetCode = () => {
    if (!window.confirm('Reset your code to the starter code? Your changes will be lost.')) return
    setCode(task.starterCode)
    localStorage.removeItem(draftKey(task.slug))
  }

  const handleRun = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    setTab('output')
    setRun({ running: true, runError: '', result: null })
    try {
      const result = await runCode({ code, stdin })
      setRun({ running: false, runError: '', result })
    } catch (err) {
      setRun({ running: false, runError: getErrorMessage(err, 'Could not run your code'), result: null })
    } finally {
      busyRef.current = false
    }
  }, [code, stdin])

  const handleSubmit = async () => {
    if (busyRef.current) return
    busyRef.current = true
    setTab('tests')
    setTest({ submitting: true, submitError: '', submission: null })
    try {
      const submission = await submitSolution({ taskSlug: task.slug, code, assignmentId })
      setTest({ submitting: false, submitError: '', submission })
      if (submission.status === 'Accepted') {
        if (submission.reward) {
          updateGamification({ points: submission.reward.totalPoints, level: submission.reward.level })
          setToast(submission.reward.levelUp
            ? `🔥 Level up! You reached level ${submission.reward.level} and earned ${submission.reward.points} points.`
            : `🔥 +${submission.reward.points} points! You now have ${submission.reward.totalPoints} points.`)
        } else if (status !== 'completed') {
          setToast(`🎉 Solved “${task.title}”! Your progress has been updated.`)
        }
        setStatus('completed')
      }
      else setStatus((s) => (s === 'completed' ? s : 'attempted'))
    } catch (err) {
      setTest({ submitting: false, submitError: getErrorMessage(err, 'Could not submit your solution'), submission: null })
    } finally {
      busyRef.current = false
    }
  }

  return (
    <div
      ref={layoutRef}
      style={{ '--left': `${split * 100}%` }}
      className="flex flex-col bg-white lg:h-[calc(100vh-4rem)] lg:flex-row"
    >
      <section className="border-b border-slate-200 lg:w-(--left) lg:shrink-0 lg:overflow-y-auto lg:border-b-0">
        <div className="border-b border-slate-100 px-5 pt-4">
          <Link to={`/topics/${task.category}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <Icon d={icons.back} className="size-4" />
            Back to topic
          </Link>
        </div>
        <ProblemPanel task={task} status={status} />
      </section>

      <ResizeHandle
        direction="horizontal"
        containerRef={layoutRef}
        onChange={(r) => setSplit(clamp(r, 0.25, 0.65))}
      />

      <section
        ref={rightRef}
        style={{ '--console': `${consoleSize * 100}%` }}
        className="flex min-w-0 flex-col lg:flex-1"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
          <span className="font-mono text-sm text-slate-600">main.c</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center overflow-hidden rounded-md border border-slate-300 bg-white" role="group" aria-label="Editor font size">
              <button onClick={() => changeFont(-1)} disabled={fontSize <= 10} aria-label="Decrease font size" className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40">A−</button>
              <span className="px-1 text-xs text-slate-500" aria-live="polite">{fontSize}</span>
              <button onClick={() => changeFont(1)} disabled={fontSize >= 24} aria-label="Increase font size" className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40">A+</button>
            </div>
            <button
              onClick={toggleWrap}
              aria-pressed={wrap}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${wrap ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              Wrap
            </button>
            <button
              onClick={copyCode}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={resetCode}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Reset Code
            </button>
          </div>
        </div>

        <div className="h-[400px] min-h-[400px] lg:h-auto lg:min-h-[200px] lg:flex-1">
          <CodeEditor value={code} onChange={updateCode} theme={theme} onRun={handleRun} fontSize={fontSize} wordWrap={wrap} />
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 bg-slate-50 px-3 py-2.5">
          <Button type="button" onClick={handleRun} loading={run.running} disabled={busy} className="w-auto!">
            {run.running ? 'Running…' : '▶ Run Code'}
          </Button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {test.submitting ? 'Submitting…' : 'Submit'}
          </button>
          {status === 'completed' && task.nextSlug && (
            <button
              type="button"
              onClick={() => navigate(`/tasks/${task.nextSlug}`)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-500 px-4 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              Next Question →
            </button>
          )}
          <span className="ml-auto hidden text-xs text-slate-400 sm:inline">{isMac ? '⌘' : 'Ctrl'} + Enter to run</span>
        </div>

        <ResizeHandle
          direction="vertical"
          containerRef={rightRef}
          onChange={(r) => setConsoleSize(clamp(r, 0.15, 0.7))}
        />

        <div className="h-72 shrink-0 border-t border-slate-200 lg:h-(--console) lg:border-t-0">
          <ConsolePanel tab={tab} setTab={setTab} stdin={stdin} setStdin={setStdin} run={run} test={test} />
        </div>
      </section>
      {toast && (
        <div role="status" className="animate-pop fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

export default function TaskDetail() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')
  const { data: task, loading, error } = useAsync(() => fetchTask(slug), slug)

  if (loading) return <LoadingBlock label="Loading task…" />
  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <ErrorBlock message={error} />
        <Link to="/tasks" className="text-sm font-semibold text-brand-600">
          ← Back to tasks
        </Link>
      </div>
    )
  }

  // Cancel the layout's page padding so the IDE can use the full content area.
  return (
    <div className="-m-4 sm:-m-6">
      <Workspace key={`${task.slug}:${assignmentId ?? 'practice'}`} task={task} assignmentId={assignmentId} />
    </div>
  )
}
