import { Link } from 'react-router-dom'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock } from '../components/States'
import TopicCard from '../components/TopicCard'
import ProgressBar from '../components/ProgressBar'
import { LAST_TASK_KEY } from '../utils/lastTask'

export default function Topics() {
  const { data, loading, error } = useAsync(fetchTasks, 'topics')

  if (loading) return <LoadingBlock label="Loading topics…" />
  if (error) return <ErrorBlock message={error} />

  const { categories, stats, continueTask } = data
  const last = (() => {
    try {
      return JSON.parse(localStorage.getItem(LAST_TASK_KEY))
    } catch {
      return null
    }
  })()
  const resume = last && data.tasks.find((t) => t.slug === last.slug && t.status !== 'completed')

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="profile-enter relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="pointer-events-none absolute -top-28 -right-12 -z-10 size-80 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 bottom-0 -z-10 size-56 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">Your learning roadmap</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">C Programming</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
              Follow a guided path from your first Hello World to building with files. Learn at your pace, one topic at a time.
            </p>
          </div>
          <Link
            to="/playground"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-md"
          >
            <span className="font-mono text-brand-600">{'<>'}</span>
            Open C Playground
          </Link>
        </div>
      </section>

      <section className="profile-enter grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]" style={{ animationDelay: '70ms' }}>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Your progress</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{stats.completed} <span className="font-medium text-slate-500">of {stats.total} questions solved</span></p>
            </div>
            <span className="text-2xl font-bold tracking-tight text-brand-600">{stats.percent}%</span>
          </div>
          <div className="mt-4"><ProgressBar percent={stats.percent} label="Overall progress" size="h-2" /></div>
        </div>
        {(resume || continueTask) && (
          <Link
            to={`/tasks/${(resume || continueTask).slug}`}
            className="group flex items-center gap-4 rounded-3xl bg-linear-to-br from-brand-600 to-violet-600 p-5 text-white shadow-md shadow-brand-900/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:min-w-72 sm:p-6"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M8 5v14l11-7-11-7z" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-indigo-100">{resume ? 'Pick up where you left off' : 'Next up for you'}</span>
              <span className="mt-1 block truncate text-sm font-bold">{(resume || continueTask).title}</span>
            </span>
            <span className="text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
        )}
      </section>

      <section className="profile-enter" style={{ animationDelay: '130ms' }}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">Explore and practice</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Your topics</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
            {categories.length} topics
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
        </div>
      </section>
    </div>
  )
}
