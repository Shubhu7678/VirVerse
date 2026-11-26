import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock } from 'lucide-react'
import { fetchTaskSummary } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock } from '../components/States'
import TopicCard from '../components/TopicCard'
import ProgressBar from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'
import { buttonClasses } from '../components/buttonStyles'
import { lastTaskKey } from '../utils/lastTask'

function readLastSlug(userId) {
  try {
    return JSON.parse(localStorage.getItem(lastTaskKey(userId)))?.slug
  } catch {
    return undefined
  }
}

export default function Topics({ language = 'c' }) {
  const title = language === 'javascript' ? 'JavaScript' : language === 'python' ? 'Python' : 'C'
  const { user } = useAuth()
  const prefix = language === 'c' ? '' : `/${language}`
  const { data, loading, error } = useAsync(() => fetchTaskSummary(language, readLastSlug(user.id)), `topics-${user.id}-${language}`)

  if (loading) return <LoadingBlock label="Loading topics…" />
  if (error) return <ErrorBlock message={error} />

  const { categories, stats, continueTask } = data
  const resume = data.resumeTask
  const nextTask = resume || continueTask
  const open = categories.filter((topic) => !topic.locked)
  const locked = categories.filter((topic) => topic.locked)
  const base = prefix || ''
  const resources = [
    ...(language === 'python' ? [{ label: 'Beginner guide', hint: 'Short lessons for first-timers', to: '/python/guide' }] : []),
    { label: 'Practice problems', hint: 'Every question in one list', to: `${base}/practice` },
    { label: 'Playground', hint: 'Try code without a question', to: `${base}/playground` },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">{title} programming</h2>
          <p className="mt-1 text-fg-muted">Build a strong foundation in {title}, from the basics to advanced concepts.</p>
        </div>
        {nextTask ? (
          <Link to={`${prefix}/tasks/${nextTask.slug}`} className={buttonClasses({ size: 'lg', className: 'max-w-full shrink-0' })}>
            <span className="truncate">{resume ? 'Resume' : stats.completed > 0 ? 'Continue' : 'Start'}: {nextTask.title}</span>
            <Icon d={icons.arrow} className="size-4 shrink-0" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-success">
            <Icon d={icons.check} className="size-4" /> All available questions complete
          </span>
        )}
      </header>

      <section aria-label="Progress and shortcuts" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col justify-between gap-5 rounded-card border border-line bg-surface p-5">
          <div>
            <p className="text-sm text-fg-subtle">Your progress</p>
            <p className="mt-1 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-3xl font-semibold tracking-tight text-fg">{stats.completed}</span>
              <span className="text-fg-muted">of {stats.total} available solved</span>
            </p>
          </div>
          <div>
            <ProgressBar percent={stats.percent} label="Overall topic progress" />
            <p className="mt-2 flex justify-between text-xs tabular-nums text-fg-subtle">
              <span>{stats.pending} left to solve</span>
              <span>{stats.percent}%</span>
            </p>
          </div>
        </div>
        <ul className={`grid gap-3 ${resources.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {resources.map((r) => (
            <li key={r.to}>
              <Link to={r.to} className="group flex h-full flex-col justify-between gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2">
                <span className="font-medium text-fg">{r.label}</span>
                <span className="flex items-end justify-between gap-2 text-xs text-fg-muted">
                  {r.hint}
                  <Icon d={icons.arrow} className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="open-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="open-heading" className="text-lg font-semibold text-fg">{locked.length > 0 ? 'Available to you' : `${title} topics`}</h2>
          <span className="text-sm text-fg-subtle tabular-nums">{open.length} {open.length === 1 ? 'topic' : 'topics'}</span>
        </div>
        <ol className="stagger overflow-hidden rounded-card border border-line bg-surface">
          {open.map((topic, i) => (
            <TopicCard key={topic.slug} topic={topic} language={language} index={Math.min(i, 12)} isNext={Boolean(nextTask) && nextTask.category === topic.slug} />
          ))}
        </ol>
      </section>

      {locked.length > 0 && (
        <section aria-labelledby="locked-heading">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="locked-heading" className="flex items-center gap-2 text-lg font-semibold text-fg">
              <Lock className="size-4 text-fg-subtle" aria-hidden="true" /> Locked topics
            </h2>
            <p className="text-sm text-fg-muted">Ask your admin to unlock {title} and these open up.</p>
          </div>
          <ol className="overflow-hidden rounded-card border border-dashed border-line-strong bg-surface">
            {locked.map((topic, i) => (
              <TopicCard key={topic.slug} topic={topic} language={language} index={Math.min(i, 12)} />
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
