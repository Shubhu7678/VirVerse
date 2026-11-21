import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock } from '../components/States'
import TopicCard from '../components/TopicCard'
import ProgressBar from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'
import { buttonClasses } from '../components/buttonStyles'
import { LAST_TASK_KEY } from '../utils/lastTask'

export default function Topics({ language = 'c' }) {
  const title = language === 'javascript' ? 'JavaScript' : language === 'python' ? 'Python' : 'C'
  const prefix = language === 'c' ? '' : `/${language}`
  const { data, loading, error } = useAsync(() => fetchTasks(language), `topics-${language}`)

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
  const resume = last && data.tasks.find((task) => task.slug === last.slug && task.status !== 'completed')
  const nextTask = resume || continueTask
  const lockedCount = categories.filter((topic) => topic.locked).length

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">{title} programming</h2>
          <p className="mt-1 text-fg-muted">Build a strong foundation in {title}, from the basics to advanced concepts.</p>
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="text-fg-muted tabular-nums">{stats.completed} of {stats.total} questions completed</span>
              <span className="font-medium text-fg tabular-nums">{stats.percent}%</span>
            </div>
            <ProgressBar percent={stats.percent} label="Overall topic progress" />
          </div>
        </div>
        {nextTask ? (
          <Link to={`${prefix}/tasks/${nextTask.slug}`} className={buttonClasses({ size: 'lg', className: 'max-w-full shrink-0' })}>
            <span className="truncate">{resume ? 'Resume' : 'Continue'}: {nextTask.title}</span>
            <Icon d={icons.arrow} className="size-4 shrink-0" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-success">
            <Icon d={icons.check} className="size-4" /> All topics complete
          </span>
        )}
      </section>

      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="mb-3 text-lg font-semibold text-fg">{title} topics</h2>
        <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((topic, i) => (
            <TopicCard key={topic.slug} topic={topic} language={language} index={Math.min(i, 12)} />
          ))}
        </div>
      </section>

      {lockedCount > 0 && (
        <aside className="flex items-start gap-3 rounded-card border border-line bg-surface-2 p-4 text-sm text-fg-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-medium text-fg">Some topics are locked.</strong> Join an organization with an active VirVerse subscription to unlock them all.
          </p>
        </aside>
      )}
    </div>
  )
}
