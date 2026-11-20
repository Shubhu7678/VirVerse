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
import ProgressBar from '../components/ProgressBar'
import Select from '../components/ui/Select'
import { useToast } from '../components/ui/Toast'
import { Check, ChevronRight, Copy, Minus, Play, Plus, RotateCcw, WrapText } from 'lucide-react'
import ProblemPanel from '../components/ide/ProblemPanel'
import CodeEditor from '../components/ide/CodeEditor'
import ConsolePanel from '../components/ide/ConsolePanel'
import ResizeHandle from '../components/ide/ResizeHandle'
import { rememberTask } from '../utils/lastTask'
import { taskPath, topicPath } from '../utils/languageRoutes'
import { useAuth } from '../context/AuthContext'

const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
const draftKey = (slug) => `virvese:draft:${slug}`
const editorThemeKey = 'virvese:python-editor-theme'
const editorLigaturesKey = 'virvese:editor-ligatures'
const editorThemeOptions = ['app', 'virverse-vscode-dark', 'virverse-one-dark', 'virverse-dracula']
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
  const [editorTheme, setEditorTheme] = useState(() => {
    const saved = localStorage.getItem(editorThemeKey)
    return editorThemeOptions.includes(saved) ? saved : 'app'
  })
  const [fontLigatures, setFontLigatures] = useState(() => localStorage.getItem(editorLigaturesKey) === '1')
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [formatting, setFormatting] = useState(false)
  const editorRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const { show } = useToast()
  const setToast = (message, tone) => show(message, { tone })
  const navigate = useNavigate()

  useEffect(() => rememberTask(task.slug, task.title), [task.slug, task.title])

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
      setToast('Could not copy. Select the code and press Ctrl/Cmd + C instead.', 'error')
    }
  }

  const changeEditorTheme = (event) => {
    const next = event.target.value
    setEditorTheme(next)
    localStorage.setItem(editorThemeKey, next)
  }

  const toggleLigatures = () =>
    setFontLigatures((enabled) => {
      localStorage.setItem(editorLigaturesKey, enabled ? '0' : '1')
      return !enabled
    })

  const formatCode = async () => {
    if (formatting || busyRef.current || !editorRef.current) return
    setFormatting(true)
    try {
      const action = editorRef.current.getAction('editor.action.formatDocument')
      if (!action) throw new Error('The Python formatter is not available.')
      const model = editorRef.current.getModel()
      const before = model?.getValue()
      await action.run()
      setToast(model && model.getValue() !== before
        ? 'Python code formatted with Ruff.'
        : 'Code is already formatted.', 'success')
    } catch (error) {
      setToast(error instanceof Error
        ? `Could not format Python code: ${error.message}`
        : 'Could not format Python code.', 'error')
    } finally {
      setFormatting(false)
    }
  }

  const [run, setRun] = useState({ running: false, runError: '', result: null })
  const [test, setTest] = useState({ submitting: false, submitError: '', submission: null })
  const [status, setStatus] = useState(task.status)
  const busyRef = useRef(false)

  const [split, setSplit] = useState(0.34)
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
      const result = await runCode({ code, stdin, language: task.language })
      setRun({ running: false, runError: '', result })
    } catch (err) {
      setRun({ running: false, runError: getErrorMessage(err, 'Could not run your code'), result: null })
    } finally {
      busyRef.current = false
    }
  }, [code, stdin, task.language])

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
            ? `Level up! You reached level ${submission.reward.level} and earned ${submission.reward.points} points.`
            : `+${submission.reward.points} points. You now have ${submission.reward.totalPoints} points.`, 'success')
        } else if (status !== 'completed') {
          setToast(`Solved “${task.title}”. Your progress has been updated.`, 'success')
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

  const statusLabel = status === 'completed' ? 'Completed' : status === 'attempted' ? 'In progress' : 'Ready to solve'
  const fileExtension = task.language === 'javascript' ? 'js' : task.language === 'python' ? 'py' : 'c'

  return (
    <div className="flex flex-col bg-bg lg:h-[calc(100dvh-3.5rem)]">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-surface px-4 py-2.5">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-fg-muted">
          <Link to={topicPath(task.language, task.category)} aria-label="Back to topic" className="rounded-control p-1 transition-colors hover:bg-surface-2 hover:text-fg">
            <Icon d={icons.back} className="size-4" />
          </Link>
          <span className="hidden sm:inline">Topics</span>
          <ChevronRight className="hidden size-3.5 text-fg-subtle sm:block" aria-hidden="true" />
          <span className="hidden capitalize sm:inline">{task.category.replaceAll('-', ' ')}</span>
          <ChevronRight className="hidden size-3.5 text-fg-subtle sm:block" aria-hidden="true" />
          <strong className="truncate font-medium text-fg">{task.title}</strong>
        </nav>
        <div className="w-full sm:w-56">
          <div className="mb-1 flex justify-between text-xs text-fg-muted">
            <span>Question {String(task.questionOrder || 1).padStart(2, '0')}</span>
            <span>{statusLabel}</span>
          </div>
          <ProgressBar percent={status === 'completed' ? 100 : 0} label="Question completion" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row" ref={layoutRef} style={{ '--left': `${split * 100}%` }}>
        <section className="max-h-[45vh] min-h-70 overflow-auto bg-surface lg:max-h-none lg:w-(--left) lg:flex-none">
          <ProblemPanel task={task} status={status} />
        </section>

        <ResizeHandle
          direction="horizontal"
          containerRef={layoutRef}
          onChange={(r) => setSplit(clamp(r, 0.25, 0.55))}
        />

        <section
          ref={rightRef}
          style={{ '--console': `${consoleSize * 100}%` }}
          className="flex h-180 min-h-0 min-w-0 flex-none flex-col border-t border-line lg:h-auto lg:flex-1 lg:border-t-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-3 py-2">
            <div className="flex items-center gap-2 rounded-md bg-surface-2 px-2.5 py-1 font-mono text-xs text-fg">
              main.{fileExtension}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <div className="flex items-center" role="group" aria-label="Editor font size">
                <ToolButton onClick={() => changeFont(-1)} disabled={fontSize <= 10} label="Decrease font size"><Minus className="size-4" aria-hidden="true" /></ToolButton>
                <span aria-live="polite" className="w-6 text-center font-mono text-xs text-fg-muted tabular-nums">{fontSize}</span>
                <ToolButton onClick={() => changeFont(1)} disabled={fontSize >= 24} label="Increase font size"><Plus className="size-4" aria-hidden="true" /></ToolButton>
              </div>
              {task.language === 'python' && (
                <>
                  <Select
                    label="Editor theme"
                    value={editorTheme}
                    onChange={changeEditorTheme}
                    className="w-36 [&_select]:h-8 [&_select]:text-xs"
                  >
                    <option value="app">App theme</option>
                    <option value="virverse-vscode-dark">VS Code Dark</option>
                    <option value="virverse-one-dark">One Dark</option>
                    <option value="virverse-dracula">Dracula</option>
                  </Select>
                  <ToolButton onClick={toggleLigatures} pressed={fontLigatures} label="Toggle font ligatures">Ligatures</ToolButton>
                  <ToolButton onClick={formatCode} disabled={formatting || busy} busy={formatting} label="Format Python code with Ruff">
                    {formatting ? 'Formatting…' : 'Format'}
                  </ToolButton>
                </>
              )}
              <ToolButton onClick={toggleWrap} pressed={wrap} label="Toggle word wrap"><WrapText className="size-4" aria-hidden="true" /> Wrap</ToolButton>
              <ToolButton onClick={copyCode} label="Copy code">
                {copied ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy'}
              </ToolButton>
              <ToolButton onClick={toggleTheme} label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
                <Icon d={theme === 'dark' ? icons.sun : icons.moon} className="size-4" />
              </ToolButton>
              <ToolButton onClick={resetCode} label="Reset to starter code"><RotateCcw className="size-4" aria-hidden="true" /> Reset</ToolButton>
            </div>
          </div>

          <div className="min-h-40 flex-1 [&>*]:h-full">
            <CodeEditor
              value={code}
              onChange={updateCode}
              theme={theme}
              onRun={handleRun}
              language={task.language === 'c' ? 'c' : task.language}
              fontSize={fontSize}
              fontLigatures={task.language === 'python' && fontLigatures}
              editorTheme={task.language === 'python' ? editorTheme : 'app'}
              onCursorPosition={task.language === 'python' ? setCursorPosition : undefined}
              onEditorMount={task.language === 'python' ? (editor) => { editorRef.current = editor } : undefined}
              wordWrap={wrap}
            />
          </div>

          {task.language === 'python' && (
            <div className="flex gap-4 border-t border-line bg-surface px-3 py-1 font-mono text-xs text-fg-muted" role="status" aria-label="Python editor status">
              <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
              <span>Spaces: 4</span>
              <span>Python 3</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line bg-surface px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" onClick={handleRun} loading={run.running} disabled={busy} fullWidth={false}>
                {!run.running && <Play className="size-4" aria-hidden="true" />}
                {run.running ? 'Running…' : 'Run code'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleSubmit} disabled={busy} fullWidth={false}>
                {test.submitting ? 'Submitting…' : 'Submit'}
              </Button>
              {status === 'completed' && task.nextSlug && (
                <Button type="button" variant="ghost" onClick={() => navigate(taskPath(task.language, task.nextSlug))} fullWidth={false}>
                  Next question <Icon d={icons.arrow} className="size-4" />
                </Button>
              )}
            </div>
            <span className="text-xs text-fg-subtle">{isMac ? '⌘' : 'Ctrl'} + Enter to run</span>
          </div>

          <ResizeHandle
            direction="vertical"
            containerRef={rightRef}
            onChange={(r) => setConsoleSize(clamp(r, 0.15, 0.7))}
          />

          <div className="min-h-30 flex-none basis-(--console) [&>div]:h-full [&>div]:min-h-0">
            <ConsolePanel tab={tab} setTab={setTab} stdin={stdin} setStdin={setStdin} run={run} test={test} />
          </div>
        </section>
      </div>
    </div>
  )
}

function ToolButton({ children, label, pressed, busy, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      aria-busy={busy}
      className={`inline-flex h-8 items-center gap-1.5 rounded-control px-2 text-xs font-medium transition-colors hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed ? 'bg-accent-soft text-accent-text' : 'text-fg-muted'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function TaskDetail({ language = 'c' }) {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')
  const { data: task, loading, error } = useAsync(() => fetchTask(slug), slug)

  if (loading) return <LoadingBlock label="Loading task…" />
  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <ErrorBlock message={error} />
        <Link to={language === 'c' ? '/tasks' : `/${language}`} className="text-sm font-medium text-accent-text hover:underline">
          ← Back to tasks
        </Link>
      </div>
    )
  }

  // Cancel the layout's page padding so the IDE can use the full content area.
  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <Workspace key={`${task.slug}:${assignmentId ?? 'practice'}`} task={task} assignmentId={assignmentId} />
    </div>
  )
}
