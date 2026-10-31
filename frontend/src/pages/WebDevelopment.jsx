import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import CodeEditor from '../components/ide/CodeEditor'
import ResizeHandle from '../components/ide/ResizeHandle'
import Icon, { icons } from '../components/Icon'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { fetchHtmlProgress, saveHtmlProgress } from '../api/webDevelopment'
import { getErrorMessage } from '../api/client'
import { HTML_DOCUMENTATION, HTML_LESSONS, HTML_PROJECTS, HTML_TASKS } from '../data/htmlBasics'
import { validateHtmlTask } from '../utils/htmlTaskValidation'
import './web-development.css'

const STORAGE_PREFIX = 'virverse:web-html:'
const PREVIEW_DELAY = 300
const SAVE_DELAY = 700

function storageKey(userId, taskId) {
  return `${STORAGE_PREFIX}${userId}:${taskId}`
}

function readDraft(userId, taskId, starterCode) {
  try {
    return localStorage.getItem(storageKey(userId, taskId)) ?? starterCode
  } catch {
    return starterCode
  }
}

function writeDraft(userId, taskId, code) {
  try {
    localStorage.setItem(storageKey(userId, taskId), code)
  } catch {
    // The backend remains the durable store when browser storage is unavailable.
  }
}

function createPreviewDocument(code) {
  const policy = "default-src 'none'; img-src data: http: https:; media-src data: blob: https:; style-src 'unsafe-inline'; font-src data: http: https:; form-action 'none'"
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${code}</body></html>`
}

function TaskCheck({ results, task, completed, containerRef, announcement }) {
  const passedCount = results.checks.filter((item) => item.passed).length
  const remainingCount = results.checks.length - passedCount
  return (
    <section ref={containerRef} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="task-checklist-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <Icon d={icons.check} className="size-4" />
            </span>
            <div>
              <h3 id="task-checklist-title" className="text-sm font-bold text-slate-900">What to add for this task</h3>
              <p className="mt-0.5 text-xs text-slate-500">For “{task.title}” · checklist updates as you edit.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completed && (
            <span className="html-completion-check inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200">
              <span aria-hidden="true">✓</span> {task.category === 'project' ? 'Project' : 'Lesson'} marked done
            </span>
          )}
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            remainingCount === 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200' : 'bg-amber-50 text-amber-800'
          }`}>
            {remainingCount === 0 ? 'Ready to finish' : `${remainingCount} ${remainingCount === 1 ? 'item' : 'items'} left`}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${remainingCount === 0 ? 'bg-emerald-500' : 'bg-brand-500'}`}
            style={{ width: `${(passedCount / results.checks.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500">{passedCount} of {results.checks.length} complete</span>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {results.checks.map((item) => (
          <li key={item.label} className={`flex min-h-16 items-start gap-2.5 rounded-lg border p-2.5 transition-colors ${
            item.passed ? 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/40' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
              item.passed ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white text-slate-400'
            }`} aria-hidden="true">
              {item.passed ? <Icon d={icons.check} className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <span className="min-w-0">
              <span className={`block text-xs font-semibold ${item.passed ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-700'}`}>
                {item.label}
                <span className={`ml-1.5 text-[10px] font-medium ${item.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}`}>
                  {item.passed ? 'Done' : 'To do'}
                </span>
              </span>
              <span className={`mt-1 block text-[11px] leading-relaxed ${item.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}>
                {item.passed ? 'This requirement is in your code.' : item.hint}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      {remainingCount === 0 && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          Nice work — every requirement is in place. You can now mark the lesson done or keep practicing.
        </p>
      )}
    </section>
  )
}

function LessonPanel({ task, tab, setTab }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b border-slate-200 px-3" role="tablist" aria-label="Lesson resources">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'instructions'}
          onClick={() => setTab('instructions')}
          className={`border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${tab === 'instructions' ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Task instructions
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'documentation'}
          onClick={() => setTab('documentation')}
          className={`border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${tab === 'documentation' ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          HTML documentation
        </button>
      </div>

      {tab === 'instructions' ? (
        <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
          <div>
            <p className="text-sm leading-relaxed text-slate-700">{task.instructions}</p>
            <h3 className="mt-3 text-xs font-bold text-slate-700">You’ll practice</h3>
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {task.objectives.map((objective) => (
                <li key={objective} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
                  <span aria-hidden="true">•</span>{objective}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Expected behavior</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{task.expectedBehavior}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{task.documentation}</p>
          </div>
        </div>
      ) : (
        <div className="html-doc-scroll max-h-80 overflow-y-auto p-4">
          <div className="mb-4 rounded-lg border border-brand-100 bg-brand-50/60 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700">For this task</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{task.documentation}</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100"><code>{task.example}</code></pre>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {HTML_DOCUMENTATION.map((concept) => (
              <article key={concept.title} className="rounded-lg border border-slate-200 p-3">
                <h3 className="text-sm font-semibold text-slate-800">{concept.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{concept.explanation}</p>
                <p className="mt-2 font-mono text-[11px] text-brand-700">{concept.syntax}</p>
                <pre className="mt-2 overflow-x-auto rounded-md bg-slate-900 p-2.5 text-[11px] leading-relaxed text-slate-100"><code>{concept.example}</code></pre>
                <p className="mt-2 text-xs text-slate-500"><span className="font-semibold text-slate-600">Result:</span> {concept.result}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default function WebDevelopment() {
  const navigate = useNavigate()
  const { taskId } = useParams()
  const { user } = useAuth()
  const activeTask = HTML_TASKS.find((task) => task.id === taskId) ?? HTML_TASKS[0]
  const [codeByTask, setCodeByTask] = useState(() => Object.fromEntries(
    HTML_TASKS.map((task) => [task.id, readDraft(user.id, task.id, task.starterCode)]),
  ))
  const [progressByTask, setProgressByTask] = useState({})
  const [lessonTab, setLessonTab] = useState('instructions')
  const [preview, setPreview] = useState(() => createPreviewDocument(activeTask.starterCode))
  const [split, setSplit] = useState(0.5)
  const [loadState, setLoadState] = useState('loading')
  const [saveState, setSaveState] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [completionBusy, setCompletionBusy] = useState(false)
  const [checkAnnouncement, setCheckAnnouncement] = useState('')
  const workspaceRef = useRef(null)
  const checklistRef = useRef(null)
  const saveQueueRef = useRef(Promise.resolve())
  const editRevisionsRef = useRef({})
  const editedTasksRef = useRef(new Set())
  const editedBeforeLoadRef = useRef(new Set())
  const { theme } = useTheme()
  const code = codeByTask[activeTask.id] ?? activeTask.starterCode
  const completedCount = useMemo(
    () => HTML_TASKS.filter((task) => progressByTask[task.id]?.completed).length,
    [progressByTask],
  )
  const validation = useMemo(() => {
    try {
      return validateHtmlTask(activeTask.id, code)
    } catch (error) {
      return { passed: false, checks: [{ label: 'Could not check this HTML document', passed: false, hint: error.message }] }
    }
  }, [activeTask.id, code])

  useEffect(() => {
    let mounted = true
    fetchHtmlProgress()
      .then((records) => {
        if (!mounted) return
        const progress = {}
        const savedCode = {}
        for (const record of records) {
          progress[record.taskId] = { completed: record.completed, updatedAt: record.updatedAt }
          if (typeof record.code === 'string' && !editedBeforeLoadRef.current.has(record.taskId)) {
            savedCode[record.taskId] = record.code
            writeDraft(user.id, record.taskId, record.code)
          }
        }
        setProgressByTask(progress)
        setCodeByTask((current) => ({ ...current, ...savedCode }))
        setLoadState('ready')
        setErrorMessage('')
      })
      .catch((error) => {
        if (!mounted) return
        setLoadState('error')
        setErrorMessage(getErrorMessage(error, 'Could not load saved HTML progress. Your local drafts are still available.'))
      })
    return () => { mounted = false }
  }, [user.id])

  useEffect(() => {
    const timer = setTimeout(() => setPreview(createPreviewDocument(code)), PREVIEW_DELAY)
    return () => clearTimeout(timer)
  }, [code])

  const enqueueSave = useCallback((taskId, payload, revision = null) => {
    const operation = saveQueueRef.current.then(async () => {
      setSaveState('saving')
      const saved = await saveHtmlProgress(taskId, payload)
      if (typeof payload.code === 'string' && revision === editRevisionsRef.current[taskId]) {
        editedTasksRef.current.delete(taskId)
      }
      setSaveState('saved')
      setErrorMessage('')
      return saved
    }).catch((error) => {
      setSaveState('error')
      setErrorMessage(getErrorMessage(error, 'Could not save HTML progress. Your local draft is preserved.'))
      return null
    })
    saveQueueRef.current = operation
    return operation
  }, [])

  useEffect(() => {
    if (loadState !== 'ready' || !editedTasksRef.current.has(activeTask.id)) return undefined
    const revision = editRevisionsRef.current[activeTask.id]
    const timer = setTimeout(() => {
      enqueueSave(activeTask.id, { code }, revision)
    }, SAVE_DELAY)
    return () => clearTimeout(timer)
  }, [activeTask.id, code, enqueueSave, loadState])

  const changeCode = (value) => {
    editedTasksRef.current.add(activeTask.id)
    if (loadState === 'loading') editedBeforeLoadRef.current.add(activeTask.id)
    editRevisionsRef.current[activeTask.id] = (editRevisionsRef.current[activeTask.id] ?? 0) + 1
    setCodeByTask((current) => ({ ...current, [activeTask.id]: value }))
    writeDraft(user.id, activeTask.id, value)
    setSaveState('pending')
  }

  const checkTask = useCallback(() => {
    const remaining = validation.checks.filter((item) => !item.passed).length
    setCheckAnnouncement(remaining === 0
      ? 'All task requirements are complete.'
      : `${remaining} task ${remaining === 1 ? 'requirement remains' : 'requirements remain'}. See the checklist for what to add.`)
    checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [validation])

  const selectTask = (task) => {
    if (editedTasksRef.current.has(activeTask.id)) {
      enqueueSave(activeTask.id, { code }, editRevisionsRef.current[activeTask.id])
    }
    navigate(`/web-development/html-basics/${task.id}`)
    setLessonTab('instructions')
  }

  const toggleCompletion = async () => {
    if (completionBusy || loadState !== 'ready') return
    const wasCompleted = Boolean(progressByTask[activeTask.id]?.completed)
    const completed = !wasCompleted
    setCompletionBusy(true)
    setProgressByTask((current) => ({
      ...current,
      [activeTask.id]: { ...current[activeTask.id], completed },
    }))
    const revision = editRevisionsRef.current[activeTask.id]
    const saved = await enqueueSave(activeTask.id, { code, completed }, revision)
    if (!saved) {
      setProgressByTask((current) => ({
        ...current,
        [activeTask.id]: { ...current[activeTask.id], completed: wasCompleted },
      }))
    }
    setCompletionBusy(false)
  }

  const resetCode = () => {
    if (!window.confirm('Reset this task to its starter code? Your completion status will not change.')) return
    changeCode(activeTask.starterCode)
    setCheckAnnouncement('')
  }

  const setTaskByOffset = (offset) => {
    const index = HTML_TASKS.findIndex((task) => task.id === activeTask.id)
    const next = HTML_TASKS[index + offset]
    if (next) selectTask(next)
  }

  if (!HTML_TASKS.some((task) => task.id === taskId)) {
    return <Navigate to="/web-development/html-basics" replace />
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate('/web-development/html', { state: { expandLessons: true } })}
              className="mb-2 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-slate-500 transition hover:text-brand-700 focus-visible:outline-brand-500"
            >
              <Icon d={icons.back} className="size-3.5" />
              Back to HTML lessons
            </button>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span>Web Development</span><span aria-hidden="true">/</span><span>HTML</span>
              {activeTask.category === 'project' && <><span aria-hidden="true">/</span><span>Projects</span></>}
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">Beginner</span>
              <span>{activeTask.category === 'project' ? 'Guided project' : 'Beginner lesson'}</span>
            </div>
            <h1 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{activeTask.title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
              {activeTask.category === 'project'
                ? 'Bring the HTML concepts together in a guided project. Follow the checklist, build at your own pace, and preview your work.'
                : 'Learn how to structure web pages with HTML, then practice each concept in a live coding workspace.'}
            </p>
          </div>
          <div className="min-w-52 sm:w-64" aria-label={`${completedCount} of ${HTML_TASKS.length} learning activities completed`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Your progress</span>
              <span className="tabular-nums text-slate-500">{completedCount} / {HTML_TASKS.length}</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="HTML Basics completion"
              aria-valuemin={0}
              aria-valuemax={HTML_TASKS.length}
              aria-valuenow={completedCount}
            >
              <div className="html-progress-fill h-full rounded-full bg-brand-600" style={{ width: `${(completedCount / HTML_TASKS.length) * 100}%` }} />
            </div>
            <p className="mt-1.5 text-right text-[11px] text-slate-400">{HTML_LESSONS.length} lessons · {HTML_PROJECTS.length} projects</p>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>{errorMessage}</span>
          {loadState === 'error' && <span className="shrink-0 text-xs">Code is kept in this browser.</span>}
        </div>
      )}

      <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                {activeTask.category === 'project'
                  ? `P${String(HTML_PROJECTS.indexOf(activeTask) + 1).padStart(2, '0')}`
                  : String(HTML_LESSONS.indexOf(activeTask) + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-800">{activeTask.title}</h2>
                <p className="text-[11px] text-slate-500">Edit the HTML, then check your work.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400" aria-live="polite">
                {saveState === 'saving' || saveState === 'pending' ? 'Saving…' : saveState === 'saved' ? 'Saved' : loadState === 'loading' ? 'Loading progress…' : ''}
              </span>
              <button type="button" onClick={resetCode} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                Reset code
              </button>
              <button
                type="button"
                onClick={checkTask}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                <Icon d={icons.check} className="size-4" />
                Check task
              </button>
              <button
                type="button"
                onClick={toggleCompletion}
                disabled={loadState !== 'ready' || completionBusy}
                aria-pressed={Boolean(progressByTask[activeTask.id]?.completed)}
                title={progressByTask[activeTask.id]?.completed ? 'Reopen this lesson' : 'Mark this lesson done'}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                  progressByTask[activeTask.id]?.completed
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {completionBusy ? 'Saving…' : progressByTask[activeTask.id]?.completed ? '✓ Done · Reopen' : `Mark ${activeTask.category === 'project' ? 'project' : 'lesson'} done`}
              </button>
            </div>
          </div>

          <LessonPanel task={activeTask} tab={lessonTab} setTab={setLessonTab} />
          <TaskCheck
            results={validation}
            task={activeTask}
            completed={Boolean(progressByTask[activeTask.id]?.completed)}
            containerRef={checklistRef}
            announcement={checkAnnouncement}
          />

          <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-950 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-orange-400" />
                <span className="font-mono text-xs font-medium text-slate-200">index.html</span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">HTML editor · Live preview</span>
            </div>
            <div
              ref={workspaceRef}
              className="html-workspace-grid"
              style={{ '--editor-width': `${split * 100}%` }}
            >
              <section className="html-editor-pane min-w-0" aria-label="HTML code editor">
                <CodeEditor
                  language="html"
                  value={code}
                  onChange={changeCode}
                  theme={theme}
                  onRun={checkTask}
                  fontSize={14}
                  wordWrap
                />
              </section>
              <ResizeHandle
                direction="horizontal"
                containerRef={workspaceRef}
                onChange={(ratio) => setSplit(Math.min(Math.max(ratio, 0.25), 0.75))}
              />
              <section className="html-preview-pane min-w-0 border-t border-slate-700 lg:border-t-0 lg:border-l" aria-label="Live browser preview">
                <div className="flex h-9 items-center justify-between border-b border-slate-700 bg-slate-900 px-3">
                  <span className="text-[11px] font-semibold text-slate-300">Preview</span>
                  <span className="text-[10px] text-slate-500">Scripts disabled · isolated sandbox</span>
                </div>
                <iframe
                  title="Live HTML preview"
                  sandbox=""
                  srcDoc={preview}
                  className="block size-full min-h-[280px] bg-white"
                  referrerPolicy="no-referrer"
                />
              </section>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setTaskByOffset(-1)}
              disabled={HTML_TASKS[0].id === activeTask.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              ← Previous task
            </button>
            <p className="text-center text-[11px] text-slate-400">Your code is saved automatically for this task.</p>
            <button
              type="button"
              onClick={() => setTaskByOffset(1)}
              disabled={HTML_TASKS[HTML_TASKS.length - 1].id === activeTask.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next task →
            </button>
          </div>
        </section>
      </div>
  )
}
