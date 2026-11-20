import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTasks } from '../api/tasks'
import { fetchSubmissions } from '../api/execute'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import Icon, { icons } from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import { DifficultyBadge } from '../components/Badges'
import { buttonClasses } from '../components/buttonStyles'
import Card from '../components/ui/Card'
import { taskPath } from '../utils/languageRoutes'

const verdictTone = {
  Accepted: 'bg-success-soft text-success',
  'Wrong Answer': 'bg-danger-soft text-danger',
  'Compilation Error': 'bg-warn-soft text-warn',
  'Runtime Error': 'bg-danger-soft text-danger',
  'Time Limit Exceeded': 'bg-warn-soft text-warn',
}

function Stat({ label, value, hint, children }) {
  return (
    <Card>
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-fg tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
      {children && <div className="mt-3">{children}</div>}
    </Card>
  )
}

function PathCard({ to, mark, title, state }) {
  return (
    <Card as={Link} to={to} interactive className="group flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-control bg-surface-2 font-mono text-sm font-medium text-fg">{mark}</span>
        <Icon d={icons.arrow} className="size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>
      <div>
        <h3 className="font-semibold text-fg">{title}</h3>
        {state.loading ? (
          <p className="mt-1 text-sm text-fg-muted">Loading your progress…</p>
        ) : state.error ? (
          <p className="mt-1 text-sm text-danger">{state.error}</p>
        ) : (
          <p className="mt-1 text-sm text-fg-muted tabular-nums">
            {state.completed} of {state.total} complete · {state.topics} topics
          </p>
        )}
      </div>
      {!state.loading && !state.error && <ProgressBar percent={state.total ? Math.round((state.completed / state.total) * 100) : 0} label={`${title} progress`} />}
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [showDemoGuide, setShowDemoGuide] = useState(true)
  const { data, loading, error } = useAsync(fetchTasks, 'dashboard')
  const javascript = useAsync(() => fetchTasks('javascript'), 'dashboard-javascript')
  const python = useAsync(() => fetchTasks('python'), 'dashboard-python')
  const subs = useAsync(fetchSubmissions, 'dashboard-subs')

  if (loading) return <LoadingBlock />
  if (error) return <ErrorBlock message={error} />

  const { stats, continueTask } = data
  const recent = (subs.data || []).slice(0, 5)
  const basics = data.categories.find((category) => category.slug === 'basics')
  const isDemoComplete = Boolean(user.isDemo && basics && basics.completed === basics.total)
  const firstName = user.name?.trim().split(/\s+/)[0] || 'Learner'

  const pathState = (result) => ({
    loading: result.loading,
    error: result.error,
    completed: result.data?.stats.completed,
    total: result.data?.stats.total,
    topics: result.data?.categories.length,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">Welcome back, {firstName}</h2>
          <p className="mt-1 text-fg-muted">
            {continueTask
              ? continueTask.attempted
                ? `Ready to pick up “${continueTask.title}”?`
                : `Your next challenge is “${continueTask.title}”.`
              : 'You have completed every question.'}
          </p>
        </div>
        {continueTask && (
          <Link to={`/tasks/${continueTask.slug}`} className={buttonClasses({ size: 'lg', className: 'shrink-0' })}>
            Continue learning <Icon d={icons.arrow} className="size-4" />
          </Link>
        )}
      </section>

      {user.isDemo && showDemoGuide && (
        <Card className="border-accent/40 bg-accent-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-fg">Your C learning session starts here</h2>
              <p className="mt-0.5 text-sm text-fg-muted">Private demo · 10 questions · progress expires after 24 hours</p>
            </div>
            <button type="button" onClick={() => setShowDemoGuide(false)} className="text-sm text-fg-muted transition-colors hover:text-fg">
              Dismiss
            </button>
          </div>
          <ol className="mt-4 grid gap-3 text-sm text-fg sm:grid-cols-3">
            {['Open a C Basics question', 'Run your code and check the output', 'Submit to save your progress'].map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-xs text-accent-text">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          {basics?.nextSlug && (
            <Link to={`/tasks/${basics.nextSlug}`} className={buttonClasses({ className: 'mt-4' })}>
              {isDemoComplete ? 'Review C Basics' : continueTask?.attempted || basics.completed ? 'Continue C Basics' : 'Start question 1'}
              <Icon d={icons.arrow} className="size-4" />
            </Link>
          )}
        </Card>
      )}

      <section aria-label="Learning statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total questions" value={stats.total} />
        <Stat label="Solved" value={stats.completed} />
        <Stat label="Remaining" value={stats.pending} />
        <Stat label="Overall completion" value={`${stats.percent}%`}>
          <ProgressBar percent={stats.percent} label="Overall completion" />
        </Stat>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-fg">Learning paths</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PathCard to="/tasks" mark="C" title="C programming" state={{ loading: false, completed: stats.completed, total: stats.total, topics: data.categories.length }} />
          <PathCard to="/javascript" mark="JS" title="JavaScript" state={pathState(javascript)} />
          <PathCard to="/python" mark="Py" title="Python" state={pathState(python)} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Recent submissions</h2>
          <Link to="/submissions" className="inline-flex items-center gap-1 text-sm text-accent-text hover:underline">
            View all <Icon d={icons.arrow} className="size-3.5" />
          </Link>
        </div>
        <div className="mt-3">
          {subs.loading ? (
            <LoadingBlock />
          ) : subs.error ? (
            <ErrorBlock message={subs.error} />
          ) : recent.length === 0 ? (
            <EmptyState title="No submissions yet" text="Solve your first question and your submissions will show up here.">
              {continueTask && (
                <Link to={`/tasks/${continueTask.slug}`} className={buttonClasses({ variant: 'secondary' })}>
                  Start with “{continueTask.title}” <Icon d={icons.arrow} className="size-4" />
                </Link>
              )}
            </EmptyState>
          ) : (
            <Card padded={false} className="divide-y divide-line">
              {recent.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                  <Link
                    to={taskPath(s.task.language || 'c', s.task.slug)}
                    className="min-w-0 flex-1 basis-48 truncate font-medium text-fg hover:text-accent-text"
                  >
                    {s.task.title}
                  </Link>
                  <DifficultyBadge level={s.task.difficulty} />
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${verdictTone[s.status] || 'bg-surface-2 text-fg-muted'}`}>{s.status}</span>
                  <time dateTime={s.createdAt} className="text-xs text-fg-subtle tabular-nums">
                    {new Date(s.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
