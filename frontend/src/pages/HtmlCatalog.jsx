import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import {
  Accessibility, ArrowRight, Braces, Briefcase, CalendarDays, Captions, Check, ChefHat, ChevronsUpDown, Clapperboard,
  Clock, Code, FileCode, Heading1, Image as ImageIcon, LayoutTemplate, Link as LinkIcon, List, ListChecks, Navigation,
  PanelsTopLeft, Pilcrow, Play, Quote, Table, Tag, TextCursorInput, Type, UserRound,
} from 'lucide-react'
import { ErrorBlock } from '../components/States'
import ProgressBar from '../components/ProgressBar'
import { buttonClasses } from '../components/buttonStyles'
import { fetchHtmlProgress } from '../api/webDevelopment'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { clearAsyncCache } from '../hooks/useAsync'
import { HTML_LEVELS, HTML_LESSONS, HTML_PROJECTS, HTML_PROJECTS_BY_LEVEL, HTML_TASKS } from '../data/htmlBasics'

const COURSE_PATH = '/web-development/html'
const TOPICS_PATH = '/web-development/html-basics'
const TASKS_BY_ID = new Map(HTML_TASKS.map((task) => [task.id, task]))

// One icon per lesson, so the list can be scanned by what each lesson is about.
const TASK_ICONS = {
  'html-01-first-page': Code,
  'html-02-headings': Heading1,
  'html-03-paragraphs-breaks': Pilcrow,
  'html-04-text-formatting': Type,
  'html-05-hyperlinks': LinkIcon,
  'html-06-images': ImageIcon,
  'html-07-lists': List,
  'html-08-tables': Table,
  'html-09-forms': TextCursorInput,
  'html-10-profile-page': UserRound,
  'html-11-attributes': Tag,
  'html-12-comments-entities': Braces,
  'html-13-div-span': LayoutTemplate,
  'html-14-semantic-elements': PanelsTopLeft,
  'html-15-figure-caption': Captions,
  'html-16-audio-video': Clapperboard,
  'html-17-details-summary': ChevronsUpDown,
  'html-18-form-controls': ListChecks,
  'html-19-page-metadata': FileCode,
  'html-20-accessibility': Accessibility,
  'html-21-code-and-quotes': Quote,
  'html-22-page-navigation': Navigation,
  'html-project-portfolio': Briefcase,
  'html-project-recipe': ChefHat,
  'html-project-event': CalendarDays,
}

// The course as a flat list of sections: each level's topic groups, then its project.
const SECTIONS = (() => {
  let number = 0
  return HTML_LEVELS.flatMap((level) => {
    const groups = level.lessonGroups.map((group) => ({
      id: group.id,
      level: level.title,
      title: group.title,
      description: group.description,
      tasks: group.taskIds.map((id) => TASKS_BY_ID.get(id)).filter(Boolean),
    }))
    const projects = HTML_PROJECTS_BY_LEVEL[level.id]
    const sections = projects.length
      ? [...groups, {
        id: `projects-${level.id}`,
        level: level.title,
        title: `${level.title} project`,
        description: 'Put these skills together in a complete page.',
        tasks: projects,
      }]
      : groups
    return sections.map((section) => ({ ...section, number: (number += 1) }))
  })
})()

function useCourseProgress() {
  const { user, updateGamification } = useAuth()
  const [state, setState] = useState(() => ({
    userId: user?.id,
    progress: {},
    loading: true,
    error: '',
  }))

  useEffect(() => {
    let active = true
    fetchHtmlProgress()
      .then(({ progress: records, reward }) => {
        // Tasks finished before points existed are paid out the first time progress is loaded.
        if (reward) {
          updateGamification({ points: reward.totalPoints, level: reward.level })
          clearAsyncCache()
        }
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
  }, [user?.id, updateGamification])

  const hasCurrentUserProgress = state.userId === user?.id
  const progress = hasCurrentUserProgress ? state.progress : {}
  const loading = !hasCurrentUserProgress || state.loading
  const error = hasCurrentUserProgress ? state.error : ''
  const completedCount = HTML_TASKS.filter((task) => progress[task.id]?.completed).length

  return { progress, completedCount, loading, error }
}

const sectionOfTask = (taskId) => SECTIONS.find((section) => section.tasks.some((task) => task.id === taskId))
const countDone = (tasks, progress) => tasks.filter((task) => progress[task.id]?.completed).length

function ContinueBanner({ nextActivity, completedCount }) {
  if (!nextActivity) {
    return (
      <div className="rounded-xl bg-surface-2/70 px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-fg">You finished the HTML course</h2>
        <p className="text-sm text-fg-muted">Every lesson and project is done. You can reopen any of them to practise again.</p>
      </div>
    )
  }
  const isProject = nextActivity.category === 'project'
  const eyebrow = isProject ? 'Lessons done. Time to build' : completedCount ? 'Start where you left off' : 'Start here'
  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface-2/70 px-5 py-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-control bg-surface text-fg" aria-hidden="true">
        <Play className="size-4 fill-current" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-fg-subtle">{eyebrow}</p>
        <h2 className="truncate text-[15px] font-semibold text-fg">{nextActivity.title}</h2>
      </div>
      <Link to={`${TOPICS_PATH}/${nextActivity.id}`} className={buttonClasses({ size: 'md' })}>
        {isProject ? 'Start project' : completedCount ? 'Continue lesson' : 'Start lesson'} <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

// The left list. On wide screens it is a card of every section; on phones it becomes a scrollable row of chips.
function SectionNav({ activeId, onSelect, progress, known, completedCount }) {
  const levels = [...new Set(SECTIONS.map((section) => section.level))]
  return (
    <>
      <nav aria-label="Course content" className="hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-1">
          <div className="flex items-baseline justify-between px-2.5 pb-2">
            <h2 className="text-sm font-semibold text-fg">Course content</h2>
            <span className="text-xs text-fg-subtle tabular-nums">{known ? completedCount : 0} / {HTML_TASKS.length}</span>
          </div>
          {levels.map((level) => (
            <div key={level} className="mt-2 first:mt-0">
              <p className="px-2.5 pt-3 pb-1 text-xs font-medium text-fg-subtle">{level}</p>
              <ul className="space-y-px">
                {SECTIONS.filter((section) => section.level === level).map((section) => {
                  const active = section.id === activeId
                  const done = countDone(section.tasks, progress)
                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(section.id)}
                        aria-current={active ? 'true' : undefined}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                          active ? 'bg-surface-2' : 'hover:bg-surface-2/60'
                        }`}
                      >
                        <span className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium tabular-nums ${
                          known && done === section.tasks.length
                            ? 'text-success'
                            : active ? 'bg-inset text-fg' : 'bg-surface-2 text-fg-muted'
                        }`}>
                          {known && done === section.tasks.length ? <Check className="size-4" strokeWidth={2.5} aria-hidden="true" /> : section.number}
                        </span>
                        <span className={`min-w-0 flex-1 truncate text-sm ${active ? 'font-medium text-fg' : 'text-fg-muted'}`}>{section.title}</span>
                        <span className="shrink-0 text-xs text-fg-subtle tabular-nums">{known ? done : 0}/{section.tasks.length}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <nav aria-label="Course content" className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
        <ul className="flex w-max gap-2 pb-1">
          {SECTIONS.map((section) => {
            const active = section.id === activeId
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => onSelect(section.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] whitespace-nowrap transition-colors ${
                    active ? 'border-line-strong bg-surface-2 font-medium text-fg' : 'border-line text-fg-muted hover:bg-surface-2'
                  }`}
                >
                  <span className="text-xs text-fg-subtle tabular-nums">{section.number}</span>
                  {section.title}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

function LessonRow({ task, done, isNext }) {
  const Icon = TASK_ICONS[task.id] ?? Code
  const isProject = task.category === 'project'
  return (
    <li>
      <Link
        to={`${TOPICS_PATH}/${task.id}`}
        data-task-id={task.id}
        aria-label={`${task.title}${done ? ', completed' : isNext ? ', up next' : ''}`}
        className={`group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-surface-2/60 ${isNext ? 'bg-surface-2/60' : ''}`}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-fg-muted" aria-hidden="true">
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-fg">{task.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-fg-muted">{task.objectives.slice(0, 2).join('. ')}.</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 text-xs text-fg-subtle tabular-nums sm:inline-flex">
          <Clock className="size-3.5" aria-hidden="true" /> {isProject ? '10–15 min' : '4–5 min'}
        </span>
        <span className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors ${
          done
            ? 'text-success'
            : isNext
              ? 'bg-cta text-cta-fg'
              : 'border border-line-strong text-fg-muted group-hover:bg-cta group-hover:text-cta-fg'
        }`} aria-hidden="true">
          {done ? <Check className="size-[18px]" strokeWidth={2.5} /> : <Play className="size-3.5 fill-current" />}
        </span>
      </Link>
    </li>
  )
}

function SectionPanel({ section, progress, known, nextId }) {
  const done = countDone(section.tasks, progress)
  const percent = section.tasks.length ? Math.round((done / section.tasks.length) * 100) : 0
  return (
    <section aria-labelledby="section-title" className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-fg tabular-nums" aria-hidden="true">
          {section.number}
        </span>
        <div className="min-w-0 flex-1 basis-56">
          <h2 id="section-title" className="text-base font-semibold tracking-tight text-fg">{section.title}</h2>
          <p className="text-[13px] text-fg-muted">{section.description}</p>
        </div>
        <div className="w-full sm:w-40">
          <p className="text-xs text-fg-subtle tabular-nums sm:text-right">{known ? done : 0} / {section.tasks.length} completed</p>
          <div className="mt-1.5"><ProgressBar percent={known ? percent : 0} label={`${section.title} progress`} /></div>
        </div>
      </div>
      <ol className="divide-y divide-line border-t border-line">
        {section.tasks.map((task) => (
          <LessonRow key={task.id} task={task} done={Boolean(progress[task.id]?.completed)} isNext={known && task.id === nextId} />
        ))}
      </ol>
    </section>
  )
}

function CourseOverview({ completedCount, progress, loading, error }) {
  const known = !loading && !error
  const nextActivity = HTML_TASKS.find((task) => !progress[task.id]?.completed)
  const percent = Math.round((completedCount / HTML_TASKS.length) * 100)
  // The learner's own pick wins; otherwise show the section they are working on.
  const [picked, setPicked] = useState(null)
  const currentSection = (known && nextActivity && sectionOfTask(nextActivity.id)) || SECTIONS[0]
  const activeSection = SECTIONS.find((section) => section.id === picked) ?? currentSection

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-fg">HTML basics</h1>
          <p className="mt-0.5 text-sm text-fg-muted">Build web pages step by step. Short lessons with a live editor and preview.</p>
        </div>
        <div className="w-full sm:w-52" aria-label={known ? `${completedCount} of ${HTML_TASKS.length} activities complete` : 'Progress loading'}>
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="text-fg-muted">{known ? `${completedCount} of ${HTML_TASKS.length} done` : `${HTML_LESSONS.length} lessons · ${HTML_PROJECTS.length} projects`}</span>
            <span className="font-medium text-fg tabular-nums">{known ? `${percent}%` : '–'}</span>
          </div>
          <div className="mt-1.5"><ProgressBar percent={known ? percent : 0} label="HTML course completion" /></div>
        </div>
      </header>

      {error && <ErrorBlock message={error} />}
      {known && <ContinueBanner nextActivity={nextActivity} completedCount={completedCount} />}

      <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
        <SectionNav activeId={activeSection.id} onSelect={setPicked} progress={progress} known={known} completedCount={completedCount} />
        <SectionPanel section={activeSection} progress={progress} known={known} nextId={nextActivity?.id} />
      </div>
    </div>
  )
}

export default function HtmlCatalog({ view }) {
  const [searchParams] = useSearchParams()
  const { progress, completedCount, loading, error } = useCourseProgress()
  const legacyTaskId = searchParams.get('task')

  if (view === 'topics') {
    return legacyTaskId && HTML_TASKS.some((task) => task.id === legacyTaskId)
      ? <Navigate to={`${TOPICS_PATH}/${legacyTaskId}`} replace />
      : <Navigate to={COURSE_PATH} replace />
  }

  return <CourseOverview progress={progress} completedCount={completedCount} loading={loading} error={error} />
}
