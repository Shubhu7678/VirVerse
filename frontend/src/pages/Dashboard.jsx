import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchOverview } from '../api/tasks'
import { fetchSubmissions } from '../api/execute'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import Icon, { icons } from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import { DifficultyBadge } from '../components/Badges'
import { buttonClasses } from '../components/buttonStyles'
import Card from '../components/ui/Card'
import { submissionView } from '../utils/submissionView'

const verdictTone = {
  Accepted: 'bg-success-soft text-success',
  'Wrong Answer': 'bg-danger-soft text-danger',
  'Compilation Error': 'bg-warn-soft text-warn',
  'Runtime Error': 'bg-danger-soft text-danger',
  'Time Limit Exceeded': 'bg-warn-soft text-warn',
  Completed: 'bg-success-soft text-success',
}

function PathCard({ to, mark, title, state, index = 0 }) {
  return (
    <Card as={Link} to={to} interactive className="lift group flex flex-col gap-4" style={{ '--i': index }}>
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl border border-accent-border bg-accent-soft font-mono text-sm font-semibold text-accent-text">{mark}</span>
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
  const { data, loading, error } = useAsync(fetchOverview, 'overview')
  const subs = useAsync(() => fetchSubmissions(5), 'recent-submissions-5')

  if (loading) return <LoadingBlock />
  if (error) return <ErrorBlock message={error} />

  const { c: stats, c: { continueTask } } = data
  const recent = subs.data || []
  const firstName = user.name?.trim().split(/\s+/)[0] || 'Learner'

  const pathState = (language) => ({
    loading: false,
    completed: data[language].completed,
    total: data[language].total,
    topics: data[language].topics,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {user.isDemo && showDemoGuide && (
        <aside className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface-2 px-4 py-2.5 text-sm text-fg-muted">
          <p><strong className="font-medium text-fg">Private demo</strong> · 10 C questions · progress is cleared after 24 hours</p>
          <button type="button" onClick={() => setShowDemoGuide(false)} className="shrink-0 transition-colors hover:text-fg" aria-label="Dismiss demo notice">Dismiss</button>
        </aside>
      )}

      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Welcome back, {firstName}</h2>
        <p className="mt-1 text-fg-muted">Pick up where you left off, or start a new path below.</p>
      </header>

      <section aria-label="Continue learning" className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col justify-between gap-6 rounded-card border border-line bg-surface p-6">
          {continueTask ? (
            <>
              <div>
                <p className="text-sm text-fg-subtle">{continueTask.attempted ? 'Continue where you stopped' : 'Up next'}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-fg">{continueTask.title}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-fg-muted">
                  C programming <DifficultyBadge level={continueTask.difficulty} />
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to={`/tasks/${continueTask.slug}`} className={buttonClasses({ size: 'lg' })}>
                  {continueTask.attempted ? 'Continue' : 'Start'} question <Icon d={icons.arrow} className="size-4" />
                </Link>
              </div>
            </>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-fg">All caught up</h3>
              <p className="mt-1 text-sm text-fg-muted">You have completed every available question.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-card border border-line bg-surface p-6">
          <div>
            <p className="text-sm text-fg-subtle">C programming progress</p>
            <p className="mt-1 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-3xl font-semibold tracking-tight text-fg">{stats.completed}</span>
              <span className="text-fg-muted">of {stats.total} solved</span>
            </p>
          </div>
          <div>
            <ProgressBar percent={stats.percent} label="C programming progress" />
            <p className="mt-2 flex justify-between text-xs text-fg-subtle tabular-nums">
              <span>{stats.pending} remaining</span>
              <span>{stats.percent}%</span>
            </p>
          </div>
        </div>
      </section>

      <section data-tour="dash-paths">
        <h2 className="text-lg font-semibold text-fg">Learning paths</h2>
        <div className="stagger mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PathCard to="/tasks" index={0} mark="C" title="C programming" state={pathState('c')} />
          <PathCard to="/javascript" index={1} mark="JS" title="JavaScript" state={pathState('javascript')} />
          <PathCard to="/python" index={2} mark="Py" title="Python" state={pathState('python')} />
        </div>
      </section>

      <section data-tour="dash-recent">
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
              {recent.map((s) => {
                const view = submissionView(s)
                return (
                <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                  <Link
                    to={view.to}
                    className="min-w-0 flex-1 basis-48 truncate font-medium text-fg hover:text-accent-text"
                  >
                    {view.title}
                  </Link>
                  {view.html
                    ? <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-fg-muted">{view.label}</span>
                    : <DifficultyBadge level={view.difficulty} />}
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${verdictTone[s.status] || 'bg-surface-2 text-fg-muted'}`}>{s.status}</span>
                  <time dateTime={s.createdAt} className="text-xs text-fg-subtle tabular-nums">
                    {new Date(s.createdAt).toLocaleString()}
                  </time>
                </div>
                )
              })}
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
