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
import { taskPath, topicPath } from '../utils/languageRoutes'
import { useAuth } from '../context/AuthContext'
import './task-detail.css'

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
        : 'Code is already formatted.')
    } catch (error) {
      setToast(error instanceof Error
        ? `Could not format Python code: ${error.message}`
        : 'Could not format Python code.')
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
    <div className="task-workspace">
      <header className="task-workspace-header">
        <div className="task-workspace-breadcrumb">
          <Link to={topicPath(task.language, task.category)} aria-label="Back to topic">
            <Icon d={icons.back} className="size-4" />
          </Link>
          <span>Topics</span>
          <Icon d={icons.arrow} className="size-3.5 task-breadcrumb-chevron" />
          <span className="task-breadcrumb-category">{task.category.replaceAll('-', ' ')}</span>
          <Icon d={icons.arrow} className="size-3.5 task-breadcrumb-chevron" />
          <strong>{task.title}</strong>
        </div>
        <div className="task-workspace-progress">
          <div className="task-progress-label">
            <span>Question {String(task.questionOrder || 1).padStart(2, '0')}</span>
            <span>{status === 'completed' ? 'Completed' : status === 'attempted' ? 'In progress' : 'Ready to solve'}</span>
          </div>
          <div
            className="task-progress-track"
            role="progressbar"
            aria-label="Question completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={status === 'completed' ? 100 : 0}
          >
            <span style={{ width: status === 'completed' ? '100%' : '0%' }} />
          </div>
        </div>
      </header>

      <div className="task-workspace-body" ref={layoutRef} style={{ '--left': `${split * 100}%` }}>
        <section className="task-problem-pane">
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
          className="task-editor-pane"
        >
          <div className="task-editor-toolbar">
            <div className="task-file-tab"><span /> main.{task.language === 'javascript' ? 'js' : task.language === 'python' ? 'py' : 'c'} <i /></div>
            <div className="task-editor-tools">
              <div className="task-editor-font-control" role="group" aria-label="Editor font size">
                <button onClick={() => changeFont(-1)} disabled={fontSize <= 10} aria-label="Decrease font size">A−</button>
                <span aria-live="polite">{fontSize}</span>
                <button onClick={() => changeFont(1)} disabled={fontSize >= 24} aria-label="Increase font size">A+</button>
              </div>
              {task.language === 'python' && (
                <>
                  <label className="task-editor-theme-control">
                    <span className="sr-only">Editor theme</span>
                    <select aria-label="Editor theme" value={editorTheme} onChange={changeEditorTheme}>
                      <option value="app">App theme</option>
                      <option value="virverse-vscode-dark">VS Code Dark</option>
                      <option value="virverse-one-dark">One Dark</option>
                      <option value="virverse-dracula">Dracula</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={toggleLigatures}
                    aria-label="Toggle font ligatures"
                    aria-pressed={fontLigatures}
                    className={`task-editor-control task-editor-ligatures ${fontLigatures ? 'is-active' : ''}`}
                  >
                    <span>Ligatures</span>
                    <b aria-hidden="true">fi</b>
                  </button>
                  <button
                    type="button"
                    onClick={formatCode}
                    disabled={formatting || busy}
                    aria-label="Format Python code with Ruff"
                    aria-busy={formatting}
                    className="task-editor-control task-editor-format"
                  >
                    {formatting ? 'Formatting…' : 'Format'}
                  </button>
                </>
              )}
              <button
                onClick={toggleWrap}
                aria-pressed={wrap}
                className={`task-editor-control ${wrap ? 'is-active' : ''}`}
              >
                ↵ <span>Wrap</span>
              </button>
              <button onClick={copyCode} className="task-editor-control">
                <span>{copied ? 'Copied ✓' : 'Copy'}</span>
              </button>
              <button onClick={toggleTheme} className="task-editor-control">
                <span>{theme === 'dark' ? '☀ Light' : '🌙 Dark'}</span>
              </button>
              <button onClick={resetCode} className="task-editor-control">
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="task-editor-canvas">
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
            <div
              className={`task-editor-statusbar ${editorTheme === 'app' ? (theme === 'dark' ? 'is-dark' : '') : 'is-dark'}`}
              role="status"
              aria-label="Python editor status"
            >
              <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
              <span>Spaces: 4</span>
              <span>Python 3</span>
            </div>
          )}

          <div className="task-action-bar">
            <div className="task-run-actions">
              <Button type="button" onClick={handleRun} loading={run.running} disabled={busy} className="task-run-button">
                {run.running ? 'Running…' : '▶ Run Code'}
              </Button>
              <button type="button" onClick={handleSubmit} disabled={busy} className="task-submit-button">
                {test.submitting ? 'Submitting…' : '✓ Submit'}
              </button>
              {status === 'completed' && task.nextSlug && (
                <button
                  type="button"
                  onClick={() => navigate(taskPath(task.language, task.nextSlug))}
                  className="task-next-button"
                >
                  Next Question →
                </button>
              )}
            </div>
            <span className="task-run-shortcut">{isMac ? '⌘' : 'Ctrl'} + Enter to run</span>
          </div>

          <ResizeHandle
            direction="vertical"
            containerRef={rightRef}
            onChange={(r) => setConsoleSize(clamp(r, 0.15, 0.7))}
          />

          <div className="task-console-pane">
            <ConsolePanel tab={tab} setTab={setTab} stdin={stdin} setStdin={setStdin} run={run} test={test} />
          </div>
        </section>
      </div>
      {toast && (
        <div role="status" className="animate-pop fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
          {toast}
        </div>
      )}
    </div>
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
        <Link to={language === 'c' ? '/tasks' : `/${language}`} className="text-sm font-semibold text-brand-600">
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
