import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import CodeEditor from '../components/ide/CodeEditor'
import ResizeHandle from '../components/ide/ResizeHandle'
import ConfirmModal from '../components/ConfirmModal'
import ProgressBar from '../components/ProgressBar'
import HtmlDocsDrawer from '../components/HtmlDocsDrawer'
import { docsForTask } from '../data/htmlDocsMap'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { clearAsyncCache } from '../hooks/useAsync'
import { fetchHtmlProgress, saveHtmlProgress } from '../api/webDevelopment'
import { getErrorMessage } from '../api/client'
import { HTML_LESSONS, HTML_PROJECTS, HTML_TASKS } from '../data/htmlBasics'
import { validateHtmlTask } from '../utils/htmlTaskValidation'

const STORAGE_PREFIX = 'virverse:web-html:'
// Matches the server: each HTML lesson or project pays this once.
const HTML_TASK_POINTS = 20
const PREVIEW_DELAY = 300
const SAVE_DELAY = 700
const COURSE_PATH = '/web-development/html'

// Compact, square-cornered controls with 13px text, like a macOS toolbar.
const btn = 'inline-flex h-7 items-center justify-center gap-1.5 rounded-md border px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50'
const btnSecondary = `${btn} border-line bg-surface text-fg hover:bg-surface-2`
const btnGhost = `${btn} border-transparent text-fg-muted hover:bg-surface-2 hover:text-fg`
const btnPrimary = `${btn} border-transparent bg-cta text-cta-fg hover:bg-cta-hover`

const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

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

// What to add, as a short checklist that fills in as the learner types.
function TaskCheck({ results, task, completed, containerRef, announcement, onContinue, hasNext, busy, earnsPoints }) {
  const passedCount = results.checks.filter((item) => item.passed).length
  const total = results.checks.length
  const remaining = total - passedCount + (results.unclosed?.length ? 1 : 0)
  const noun = task.category === 'project' ? 'project' : 'lesson'

  return (
    <section ref={containerRef} aria-labelledby="task-checklist-title" className="scroll-mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="task-checklist-title" className="text-[13px] font-semibold text-fg">Checklist</h2>
        <span className="text-xs text-fg-subtle tabular-nums">{passedCount} of {total}</span>
      </div>
      <div className="mt-2">
        <ProgressBar percent={Math.round((passedCount / total) * 100)} label="Checklist completion" />
      </div>
      {results.unclosed?.length > 0 && (
        <p role="status" className="mt-3 rounded-md bg-warn-soft px-3 py-2 text-xs leading-relaxed text-warn">
          Close {results.unclosed.length === 1 ? 'this tag' : 'these tags'} to finish:{' '}
          {results.unclosed.map((name, index) => (
            <span key={name}>{index > 0 && ', '}<code className="font-mono">{`</${name}>`}</code></span>
          ))}
        </p>
      )}
      <ul className="mt-3 space-y-1">
        {results.checks.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5 rounded-lg bg-surface-2/60 px-3 py-2">
            <span aria-hidden="true" className="mt-px grid size-4 shrink-0 place-items-center">
              {item.passed
                ? <Check className="size-4 text-success" strokeWidth={2.5} />
                : <span className="size-3.5 rounded-full border border-line-strong" />}
            </span>
            <span className="min-w-0">
              <span className={`block text-[13px] leading-snug ${item.passed ? 'text-fg-muted' : 'font-medium text-fg'}`}>
                {item.label}
                <span className="sr-only">{item.passed ? ' — done' : ' — to do'}</span>
              </span>
              {!item.passed && <span className="mt-0.5 block text-xs leading-relaxed text-fg-subtle">{item.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      {remaining === 0 && (
        <div className="mt-3 rounded-lg bg-surface-2 p-3">
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-fg">
            <Check className="size-4 text-success" strokeWidth={2.5} aria-hidden="true" />
            {completed ? 'Done. Nice work.' : 'Every requirement is in place.'}
          </p>
          <p className="mt-1 text-xs text-fg-muted">
            {hasNext
              ? completed ? 'Ready for the next one?' : `Mark this ${noun} done${earnsPoints ? ` to earn ${HTML_TASK_POINTS} points` : ''} and move on.`
              : completed ? 'That was the last one in the course.' : `Mark this ${noun} done${earnsPoints ? ` to earn ${HTML_TASK_POINTS} points` : ' when you are ready'}.`}
          </p>
          {(hasNext || !completed) && (
            <button type="button" onClick={onContinue} disabled={busy} className={`${btnPrimary} mt-2.5`}>
              {busy ? 'Saving…' : hasNext ? <>{completed ? 'Next lesson' : 'Mark done and continue'} <ArrowRight className="size-3.5" aria-hidden="true" /></> : 'Mark done'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

// Opens the docs drawer, and says which topic it will open on.
function DocsCard({ task, onOpen, triggerRef }) {
  const topics = docsForTask(task.id).own.map((concept) => concept.title).join(', ')
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group flex w-full items-center gap-3 rounded-lg bg-surface-2/70 px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface text-fg-muted transition-colors group-hover:text-fg">
        <BookOpen className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-fg">Read the docs</span>
        <span className="block truncate text-xs text-fg-subtle">{topics}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
    </button>
  )
}

function Instructions({ task, onOpenDocs, docsTriggerRef }) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-relaxed text-fg">{task.instructions}</p>
      <div>
        <h3 className="text-xs text-fg-subtle">You will practise</h3>
        <ul className="mt-1.5 space-y-1">
          {task.objectives.map((objective) => (
            <li key={objective} className="flex items-start gap-2 text-[13px] text-fg-muted">
              <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-fg-subtle" />
              {objective}
            </li>
          ))}
        </ul>
      </div>
      <DocsCard task={task} onOpen={onOpenDocs} triggerRef={docsTriggerRef} />
      <div className="rounded-lg bg-surface-2/70 px-3 py-2.5">
        <h3 className="text-xs text-fg-subtle">What you should see</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-fg">{task.expectedBehavior}</p>
      </div>
    </div>
  )
}

export default function WebDevelopment() {
  const navigate = useNavigate()
  const { taskId } = useParams()
  const { user, updateGamification } = useAuth()
  const toast = useToast()
  const activeTask = HTML_TASKS.find((task) => task.id === taskId) ?? HTML_TASKS[0]
  const [codeByTask, setCodeByTask] = useState(() => Object.fromEntries(
    HTML_TASKS.map((task) => [task.id, readDraft(user.id, task.id, task.starterCode)]),
  ))
  const [progressByTask, setProgressByTask] = useState({})
  const [docsOpen, setDocsOpen] = useState(false)
  const docsTriggerRef = useRef(null)
  const [preview, setPreview] = useState(() => createPreviewDocument(activeTask.starterCode))
  const [previewSize, setPreviewSize] = useState(0.4)
  const [loadState, setLoadState] = useState('loading')
  const [saveState, setSaveState] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [completionBusy, setCompletionBusy] = useState(false)
  const [checkAnnouncement, setCheckAnnouncement] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
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
      .then(({ progress: records, reward }) => {
        if (reward) {
          updateGamification({ points: reward.totalPoints, level: reward.level })
          clearAsyncCache()
        }
        if (!mounted) return
        const progress = {}
        const savedCode = {}
        for (const record of records) {
          progress[record.taskId] = { completed: record.completed, pointsAwarded: record.pointsAwarded, updatedAt: record.updatedAt }
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
  }, [user.id, updateGamification])

  useEffect(() => {
    const timer = setTimeout(() => setPreview(createPreviewDocument(code)), PREVIEW_DELAY)
    return () => clearTimeout(timer)
  }, [code])

  const enqueueSave = useCallback((taskId, payload, revision = null) => {
    const operation = saveQueueRef.current.then(async () => {
      setSaveState('saving')
      const saved = await saveHtmlProgress(taskId, payload)
      // Finishing or reopening a task changes the submissions list, so drop the cached copies.
      if (typeof payload.completed === 'boolean') clearAsyncCache()
      if (saved.reward) {
        updateGamification({ points: saved.reward.totalPoints, level: saved.reward.level })
        toast.success(saved.reward.levelUp
          ? `Level up! You reached level ${saved.reward.level} and earned ${saved.reward.points} points.`
          : `+${saved.reward.points} points. You now have ${saved.reward.totalPoints} points.`)
      }
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
  }, [toast, updateGamification])

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
    checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [validation])

  const selectTask = (task) => {
    if (editedTasksRef.current.has(activeTask.id)) {
      enqueueSave(activeTask.id, { code }, editRevisionsRef.current[activeTask.id])
    }
    navigate(`/web-development/html-basics/${task.id}`)
    setDocsOpen(false)
  }

  const toggleCompletion = async () => {
    if (completionBusy || loadState !== 'ready') return false
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
    } else {
      setProgressByTask((current) => ({
        ...current,
        [activeTask.id]: { ...current[activeTask.id], pointsAwarded: saved.progress?.pointsAwarded },
      }))
    }
    setCompletionBusy(false)
    return Boolean(saved)
  }

  // Resetting also reopens the task: the starter code no longer satisfies it, so it should not stay marked done.
  const resetCode = async () => {
    changeCode(activeTask.starterCode)
    setCheckAnnouncement('')
    const taskId = activeTask.id
    if (!progressByTask[taskId]?.completed) return
    setProgressByTask((current) => ({ ...current, [taskId]: { ...current[taskId], completed: false } }))
    const saved = await enqueueSave(taskId, { code: activeTask.starterCode, completed: false }, editRevisionsRef.current[taskId])
    if (!saved) {
      setProgressByTask((current) => ({ ...current, [taskId]: { ...current[taskId], completed: true } }))
    }
  }

  // Marks the lesson done (if it is not yet) and opens the next one.
  const finishAndContinue = async () => {
    if (!progressByTask[activeTask.id]?.completed) {
      const saved = await toggleCompletion()
      if (!saved) return
    }
    setTaskByOffset(1)
  }

  const setTaskByOffset = (offset) => {
    const index = HTML_TASKS.findIndex((task) => task.id === activeTask.id)
    const next = HTML_TASKS[index + offset]
    if (next) selectTask(next)
  }

  if (!HTML_TASKS.some((task) => task.id === taskId)) {
    return <Navigate to="/web-development/html-basics" replace />
  }

  const isProject = activeTask.category === 'project'
  const kind = isProject ? 'Project' : 'Lesson'
  const kindList = isProject ? HTML_PROJECTS : HTML_LESSONS
  const position = kindList.indexOf(activeTask) + 1
  const done = Boolean(progressByTask[activeTask.id]?.completed)
  const activeIndex = HTML_TASKS.findIndex((task) => task.id === activeTask.id)
  const saveLabel = saveState === 'saving' || saveState === 'pending'
    ? 'Saving…'
    : saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Not saved' : loadState === 'loading' ? 'Loading…' : ''

  return (
    <div className="-m-4 flex flex-col bg-bg sm:-m-6 lg:-m-8 lg:h-[calc(100dvh-3.5rem)]">
      {confirmReset && (
        <ConfirmModal
          title="Reset this task?"
          message={done ? 'Your code goes back to the starter code and this task is marked not done. Points you already earned stay.' : 'Your code goes back to the starter code.'}
          onConfirm={resetCode}
          onClose={() => setConfirmReset(false)}
        />
      )}

      <HtmlDocsDrawer task={activeTask} open={docsOpen} onClose={() => setDocsOpen(false)} triggerRef={docsTriggerRef} />

      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-3">
        <Link to={COURSE_PATH} className={btnGhost}>
          <ChevronLeft className="-ml-1 size-4" aria-hidden="true" /> Lessons
        </Link>
        <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
          <h1 className="truncate text-[13px] font-semibold text-fg">{activeTask.title}</h1>
          <span className="hidden shrink-0 text-xs text-fg-subtle tabular-nums sm:inline">{kind} {position} of {kindList.length}</span>
        </div>
        <div className="hidden items-center gap-2 md:flex" aria-label={`${completedCount} of ${HTML_TASKS.length} activities done`}>
          <div className="w-20"><ProgressBar percent={Math.round((completedCount / HTML_TASKS.length) * 100)} label="HTML course completion" /></div>
          <span className="text-xs text-fg-subtle tabular-nums">{completedCount}/{HTML_TASKS.length}</span>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-line">
          <button
            type="button"
            onClick={() => setTaskByOffset(-1)}
            disabled={activeIndex === 0}
            aria-label="Previous task"
            className="grid h-7 w-8 place-items-center text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="w-px bg-line" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setTaskByOffset(1)}
            disabled={activeIndex === HTML_TASKS.length - 1}
            aria-label="Next task"
            className="grid h-7 w-8 place-items-center text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {errorMessage && (
        <div role="alert" className="flex items-start justify-between gap-3 border-b border-warn/30 bg-warn-soft px-4 py-2.5 text-sm text-warn">
          <span>{errorMessage}</span>
          {loadState === 'error' && <span className="shrink-0 text-xs">Code is kept in this browser.</span>}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex flex-col gap-5 border-b border-line bg-surface p-4 lg:w-[22rem] lg:flex-none lg:overflow-y-auto lg:border-r lg:border-b-0 xl:w-[25rem]">
          <Instructions task={activeTask} onOpenDocs={() => setDocsOpen(true)} docsTriggerRef={docsTriggerRef} />
          <div className="border-t border-line pt-4">
            <TaskCheck
              results={validation}
              task={activeTask}
              completed={done}
              containerRef={checklistRef}
              announcement={checkAnnouncement}
              onContinue={finishAndContinue}
              hasNext={activeIndex < HTML_TASKS.length - 1}
              busy={completionBusy}
              earnsPoints={!progressByTask[activeTask.id]?.pointsAwarded}
            />
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-label="Workspace">
          <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-fg">index.html</span>
              <span className="text-xs text-fg-subtle" aria-live="polite">{saveLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setConfirmReset(true)} className={btnGhost}>
                <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
              </button>
              <button type="button" onClick={checkTask} title="Check your work (Ctrl or Cmd + Enter)" className={btnSecondary}>
                Check task
              </button>
              {(validation.passed || done) && (
                <button
                  type="button"
                  onClick={toggleCompletion}
                  disabled={loadState !== 'ready' || completionBusy}
                  aria-pressed={done}
                  title={done ? 'Reopen this task' : `Mark this ${kind.toLowerCase()} done`}
                  className={done ? btnSecondary : btnPrimary}
                >
                  {completionBusy ? 'Saving…' : done ? <><Check className="size-3.5 text-success" aria-hidden="true" /> Done · Reopen</> : `Mark ${kind.toLowerCase()} done`}
                </button>
              )}
            </div>
          </div>

          <div ref={workspaceRef} className="flex min-h-0 flex-1 flex-col" style={{ '--preview': `${previewSize * 100}%` }}>
            <div className="h-80 min-h-0 flex-none lg:h-auto lg:flex-1" aria-label="HTML code editor">
              <CodeEditor
                language="html"
                value={code}
                onChange={changeCode}
                theme={theme}
                onRun={checkTask}
                fontSize={13}
                wordWrap
              />
            </div>
            <ResizeHandle
              direction="vertical"
              containerRef={workspaceRef}
              onChange={(ratio) => setPreviewSize(clamp(ratio, 0.2, 0.7))}
            />
            <div className="flex h-72 min-h-0 flex-none flex-col border-t border-line lg:h-auto lg:basis-(--preview) lg:border-t-0" aria-label="Live browser preview">
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-line bg-surface px-3">
                <span className="text-xs text-fg-muted">Preview</span>
                <span className="text-xs text-fg-subtle">Scripts are turned off here</span>
              </div>
              <iframe
                title="Live HTML preview"
                sandbox=""
                srcDoc={preview}
                className="block min-h-0 w-full flex-1 bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
