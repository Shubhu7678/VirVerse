import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import Icon, { icons } from '../components/Icon'
import { ErrorBlock, LoadingBlock } from '../components/States'
import { fetchHtmlProgress } from '../api/webDevelopment'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { HTML_LEVELS, HTML_LESSONS, HTML_PROJECTS, HTML_PROJECTS_BY_LEVEL, HTML_TASKS } from '../data/htmlBasics'
import './web-development.css'

const COURSE_PATH = '/web-development/html'
const TOPICS_PATH = '/web-development/html-basics'

function useCourseProgress() {
  const { user } = useAuth()
  const [state, setState] = useState(() => ({
    userId: user?.id,
    progress: {},
    loading: true,
    error: '',
  }))

  useEffect(() => {
    let active = true
    fetchHtmlProgress()
      .then((records) => {
        if (!active) return
        setState({
          userId: user?.id,
          progress: Object.fromEntries(records.map((record) => [record.taskId, record])),
          loading: false,
          error: '',
        })
      })
      .catch((reason) => {
        if (active) {
          setState({
            userId: user?.id,
            progress: {},
            loading: false,
            error: getErrorMessage(reason, 'Could not load your HTML learning progress.'),
          })
        }
      })
    return () => { active = false }
  }, [user?.id])

  const hasCurrentUserProgress = state.userId === user?.id
  const progress = hasCurrentUserProgress ? state.progress : {}
  const loading = !hasCurrentUserProgress || state.loading
  const error = hasCurrentUserProgress ? state.error : ''
  const completedCount = HTML_TASKS.filter((task) => progress[task.id]?.completed).length

  return { progress, completedCount, loading, error }
}

function CatalogHeader({ eyebrow, title, description, backTo, backLabel, completedCount, loading, error }) {
  const progressPercent = loading || error ? 0 : Math.round((completedCount / HTML_TASKS.length) * 100)
  const progressLabel = loading ? 'Loading progress' : error ? 'Progress unavailable' : `${completedCount} of ${HTML_TASKS.length} activities complete`

  return (
    <header>
      {backTo && (
        <Link to={backTo} className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-brand-600">
          <Icon d={icons.back} className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            <span className="size-1.5 rounded-full bg-brand-500" />
            {eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">{description}</p>
        </div>
        <div className="html-catalog-progress flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div
            className="relative grid size-[4.5rem] shrink-0 place-items-center"
            role="progressbar"
            aria-label="HTML course completion"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progressPercent}
            aria-valuetext={progressLabel}
          >
            <svg className="size-full -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={2 * Math.PI * 30 * (1 - progressPercent / 100)}
                className="text-brand-600 transition-[stroke-dashoffset] duration-500"
              />
            </svg>
            <span className="absolute text-sm font-bold tabular-nums text-slate-900">
              {loading || error ? '—' : `${progressPercent}%`}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Your learning progress</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">
              {loading || error ? progressLabel : `${completedCount} of ${HTML_TASKS.length} activities`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {completedCount === HTML_TASKS.length && !loading && !error
                ? 'HTML path complete — great work!'
                : 'Keep going, one topic at a time.'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

function CourseCard({ completedCount, progressAvailable }) {
  const progress = Math.round((completedCount / HTML_TASKS.length) * 100)
  return (
    <article className="html-course-card group relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-24 -z-10 size-72 rounded-full bg-brand-50 blur-3xl transition duration-300 group-hover:bg-brand-100/80" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Available now
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">Beginner</span>
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">HTML Basics</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Introduction to HTML: build your first web pages step by step, learn essential elements, and practice in a safe, live coding workspace.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            <li className="inline-flex items-center gap-1.5"><Icon d={icons.list} className="size-4 text-brand-600" />{HTML_LESSONS.length} bite-sized topics</li>
            <li className="inline-flex items-center gap-1.5"><Icon d={icons.code} className="size-4 text-brand-600" />{HTML_PROJECTS.length} guided projects</li>
            <li className="inline-flex items-center gap-1.5"><Icon d={icons.terminal} className="size-4 text-brand-600" />Live code & preview</li>
            <li className="inline-flex items-center gap-1.5"><Icon d={icons.check} className="size-4 text-brand-600" />Learn at your pace</li>
          </ul>
          <p className="mt-5 text-xs font-semibold text-brand-700">
            {progressAvailable && completedCount ? 'Continue with your next topic below.' : 'Choose a level below to begin.'}
          </p>
        </div>

        <div className="html-course-preview rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-red-400" />
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="size-2 rounded-full bg-emerald-400" />
            </div>
            <span className="font-mono text-[10px] text-slate-500">your-first-page.html</span>
          </div>
          <div className="space-y-2 py-4 font-mono text-[11px] leading-relaxed">
            <p><span className="text-violet-300">&lt;h1&gt;</span><span className="text-emerald-300">Hello, world!</span><span className="text-violet-300">&lt;/h1&gt;</span></p>
            <p><span className="text-violet-300">&lt;p&gt;</span><span className="text-slate-300">Your first page starts here.</span><span className="text-violet-300">&lt;/p&gt;</span></p>
            <p className="pt-2 text-slate-500">&lt;!-- Write. Preview. Learn. --&gt;</p>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[10px]">
            <span className="text-slate-500">COURSE PROGRESS</span>
            <span className="font-semibold text-slate-300">{progressAvailable ? `${progress}%` : '—'}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
            <div className="html-progress-fill h-full rounded-full bg-brand-500" style={{ width: `${progressAvailable ? progress : 0}%` }} />
          </div>
        </div>
      </div>
    </article>
  )
}

function LevelDropdown({ level, progress, loading, error, initialExpanded = false }) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const [openGroupId, setOpenGroupId] = useState(initialExpanded ? level.lessonGroups[0]?.id : null)
  const [projectsExpanded, setProjectsExpanded] = useState(false)
  const tasksById = new Map(HTML_TASKS.map((task) => [task.id, task]))
  const lessonIds = level.lessonGroups.flatMap((group) => group.taskIds)
  const levelProjects = HTML_PROJECTS_BY_LEVEL[level.id]
  const levelTaskIds = [...lessonIds, ...levelProjects.map((task) => task.id)]
  const completedCount = levelTaskIds.filter((id) => progress[id]?.completed).length

  return (
    <section className="html-level-section overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`html-level-${level.id}`}
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50 sm:p-5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
          {level.id === 'basic' ? '01' : level.id === 'intermediate' ? '02' : '03'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{level.title}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {level.lessonGroups.reduce((sum, group) => sum + group.taskIds.length, 0)} lessons · {levelProjects.length} {levelProjects.length === 1 ? 'project' : 'projects'}
            </span>
          </span>
          <span className="mt-1 block text-xs text-slate-500">{level.description}</span>
          {!loading && !error && (
            <span className="mt-2 flex items-center gap-2">
              <span className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-brand-500 transition-[width]" style={{ width: `${levelTaskIds.length ? completedCount / levelTaskIds.length * 100 : 0}%` }} />
              </span>
              <span className="text-[10px] tabular-nums text-slate-400">{completedCount}/{levelTaskIds.length} complete</span>
            </span>
          )}
        </span>
        <svg className={`size-5 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 011.06 0L10 11.19l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.53a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div id={`html-level-${level.id}`} className="space-y-3 border-t border-slate-100 bg-slate-50/50 p-3 sm:p-5">
          {level.lessonGroups.map((group, groupIndex) => {
            const tasks = group.taskIds.map((id) => tasksById.get(id)).filter(Boolean)
            const numberOffset = level.lessonGroups
              .slice(0, groupIndex)
              .reduce((sum, previousGroup) => sum + previousGroup.taskIds.length, 0)
            const complete = tasks.filter((task) => progress[task.id]?.completed).length
            const groupExpanded = openGroupId === group.id
            const groupPanelId = `html-${level.id}-${group.id}`
            return (
              <section key={group.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  aria-expanded={groupExpanded}
                  aria-controls={groupPanelId}
                  onClick={() => setOpenGroupId((current) => current === group.id ? null : group.id)}
                  className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-slate-50 sm:px-4"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{String(groupIndex + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-800">{group.title}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{group.description}</span>
                  </span>
                  {!loading && !error && <span className="shrink-0 text-[10px] tabular-nums text-slate-400">{complete}/{tasks.length}</span>}
                  <svg className={`size-4 shrink-0 text-slate-400 transition-transform ${groupExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 011.06 0L10 11.19l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {groupExpanded && (
                  <div id={groupPanelId} className="border-t border-slate-100 p-3 sm:p-4">
                    {loading ? <LoadingBlock label="Loading lesson progress…" /> : (
                      <ol className="grid gap-3 sm:grid-cols-2">
                        {tasks.map((task, index) => (
                          <li key={task.id}>
                            <TopicCard task={task} index={numberOffset + index} completed={Boolean(progress[task.id]?.completed)} progressAvailable={!error} />
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </section>
            )
          })}

          {levelProjects.length > 0 && (
            <section className="overflow-hidden rounded-xl border border-brand-100 bg-white">
              <button
                type="button"
                aria-expanded={projectsExpanded}
                aria-controls={`html-projects-${level.id}`}
                onClick={() => setProjectsExpanded((value) => !value)}
                className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-brand-50/40 sm:px-4"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icon d={icons.code} className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-slate-800">Projects for {level.title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">Bring these skills together in a complete page.</span>
                </span>
                {!loading && !error && <span className="shrink-0 text-[10px] tabular-nums text-slate-400">{levelProjects.filter((task) => progress[task.id]?.completed).length}/{levelProjects.length} complete</span>}
                <svg className={`size-4 shrink-0 text-slate-400 transition-transform ${projectsExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 011.06 0L10 11.19l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.53a.75.75 0 01-1.06-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {projectsExpanded && (
                <div id={`html-projects-${level.id}`} className="border-t border-slate-100 p-3 sm:p-4">
                  <ol className="grid gap-3 sm:grid-cols-2">
                    {levelProjects.map((task, index) => (
                      <li key={task.id}>
                        <TopicCard task={task} index={index} completed={Boolean(progress[task.id]?.completed)} progressAvailable={!error} typeLabel="Project" />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </section>
  )
}

function CourseOverview({ completedCount, progress, loading, error, initialExpanded }) {
  const basicsRef = useRef(null)
  const nextActivity = HTML_TASKS.find((task) => !progress[task.id]?.completed)

  useEffect(() => {
    if (!initialExpanded) return
    basicsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [initialExpanded])

  return (
    <main className="html-catalog mx-auto max-w-6xl space-y-8">
      <CatalogHeader
        eyebrow="Web development · HTML"
        title="Start building for the web."
        description="Choose a level, explore a short topic, and bring your code to life in the editor."
        completedCount={completedCount}
        loading={loading}
        error={error}
      />
      {error && <ErrorBlock message={error} />}
      <section aria-labelledby="courses-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="courses-heading" className="text-sm font-bold text-slate-800">Your learning path</h2>
            <p className="mt-1 text-xs text-slate-500">All levels stay visible. Open a level and then a small topic group to begin.</p>
          </div>
          <span className="text-xs font-medium text-slate-400">3 levels · {HTML_LESSONS.length} topics</span>
        </div>
        <CourseCard
          completedCount={completedCount}
          progressAvailable={!loading && !error}
        />
          <section ref={basicsRef} id="html-basics-levels" className="html-lesson-dropdown mt-4 scroll-mt-6" aria-labelledby="html-basics-levels-title">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-600">HTML Basics</p>
                <h3 id="html-basics-levels-title" className="mt-1 text-sm font-bold text-slate-800">Pick a level to continue</h3>
                <p className="mt-1 text-xs text-slate-500">New here? Open Basic, then choose “First steps.” Projects are grouped with the level they practice.</p>
              </div>
              {!loading && !error && (
                <span className="text-xs font-medium tabular-nums text-slate-400">{completedCount}/{HTML_TASKS.length} activities complete</span>
              )}
            </div>
            {nextActivity && !loading && !error && (
              <Link
                to={`${TOPICS_PATH}/${nextActivity.id}`}
                className="html-next-lesson group mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4 transition hover:border-brand-200 hover:bg-brand-50 sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-brand-700 shadow-sm"><Icon d={icons.arrow} className="size-5" /></span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">
                      {nextActivity.category === 'project'
                        ? 'Lessons complete — time to build'
                        : completedCount ? 'Continue where you left off' : 'A good place to begin'}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{nextActivity.title}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                  {nextActivity.category === 'project' ? 'Start project' : completedCount ? 'Continue lesson' : 'Start first lesson'}
                  <Icon d={icons.arrow} className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )}
            <div className="space-y-3">
              {HTML_LEVELS.map((level, index) => (
                <LevelDropdown
                  key={level.id}
                  level={level}
                  progress={progress}
                  loading={loading}
                  error={error}
                  initialExpanded={index === 0}
                />
              ))}
            </div>
          </section>
      </section>
      <section className="grid gap-3 sm:grid-cols-3" aria-label="What to expect">
        {[
          { icon: icons.code, title: 'Small steps', text: 'Short lessons keep each new idea easy to follow.' },
          { icon: icons.terminal, title: 'Learn by doing', text: 'Practice in a real editor with a live page preview.' },
          { icon: icons.check, title: 'Know what’s next', text: 'Clear task checks show what you’ve done and what remains.' },
        ].map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icon d={item.icon} className="size-4" /></span>
            <h3 className="mt-3 text-sm font-semibold text-slate-800">{item.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p>
          </article>
        ))}
      </section>
      <p className="text-center text-xs text-slate-400">No experience needed. Start wherever you are and learn at your own pace.</p>
    </main>
  )
}

function TopicCard({ task, index, completed, progressAvailable, typeLabel = 'Lesson' }) {
  return (
    <Link
      to={`${TOPICS_PATH}/${task.id}`}
      data-task-id={task.id}
      className={`html-topic-card group flex min-h-48 flex-col rounded-xl border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-brand-500 sm:p-5 ${
        completed ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-brand-200'
      }`}
      aria-label={`${task.title}${completed ? ', completed' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${
          completed ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'
        }`}>
          {completed ? <Icon d={icons.check} className="size-5" /> : String(index + 1).padStart(2, '0')}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
          completed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`size-1.5 rounded-full ${completed ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {completed ? 'Completed' : progressAvailable ? 'Ready to start' : 'Progress unavailable'}
        </span>
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-900 transition-colors group-hover:text-brand-700">{task.title}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">{task.objectives.join(' · ')}</p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] text-slate-400">{typeLabel} {index + 1} · {typeLabel === 'Project' ? '10–15' : '4–5'} min</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
          {completed ? 'Review' : typeLabel === 'Project' ? 'Start project' : 'Start lesson'}
          <Icon d={icons.arrow} className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

export default function HtmlCatalog({ view }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { progress, completedCount, loading, error } = useCourseProgress()
  const legacyTaskId = searchParams.get('task')

  if (view === 'topics') {
    return legacyTaskId && HTML_TASKS.some((task) => task.id === legacyTaskId)
      ? <Navigate to={`${TOPICS_PATH}/${legacyTaskId}`} replace />
      : <Navigate to={COURSE_PATH} replace />
  }

  return (
    <CourseOverview
      progress={progress}
      completedCount={completedCount}
      loading={loading}
      error={error}
      initialExpanded={Boolean(location.state?.expandLessons)}
    />
  )
}
